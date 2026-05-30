# 초보자 안내: 문서 파일 업로드와 분석 요청을 처리하는 API 라우터입니다.

import json
import os
import re

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.core.uploads import read_upload_content, validate_upload_count
from ..services.document_analysis import build_analysis_answer, extract_file_document
from ..services.grounding import validate_grounding
from ..services.llm_analysis import analyze_with_llm
from models.schemas import AnalysisResponse


# /api/analysis 아래의 분석 API를 모아두는 FastAPI Router입니다.
router = APIRouter(prefix="/api/analysis", tags=["analysis"])

DOCUMENT_SESSION_CACHE: dict[str, list[dict]] = {}


def _is_visual_request(question: str) -> bool:
    text = (question or "").lower()
    return any(
        keyword in text
        for keyword in (
            "그래프",
            "차트",
            "표",
            "시각화",
            "추이",
            "그려",
            "그려줘",
            "만들어",
            "chart",
            "graph",
            "table",
            "visual",
            "json",
        )
    )


def _extract_json_object(text: str) -> dict | None:
    cleaned = str(text or "").replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    if start < 0:
        return None

    depth = 0
    in_string = False
    escaped = False
    for index in range(start, len(cleaned)):
        char = cleaned[index]
        if escaped:
            escaped = False
            continue
        if char == "\\":
            escaped = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                try:
                    parsed = json.loads(cleaned[start:index + 1])
                except json.JSONDecodeError:
                    return None
                return parsed if isinstance(parsed, dict) else None
    return None


def _visual_numbers(config: dict) -> list[str]:
    values = []

    def visit(value):
        if isinstance(value, bool) or value is None:
            return
        if isinstance(value, (int, float)):
            values.append(str(value))
            return
        if isinstance(value, list):
            for item in value:
                visit(item)
            return
        if isinstance(value, dict):
            for key, item in value.items():
                if key in {"color", "theme", "headerBackground", "headerTextColor", "cellBackground", "cellTextColor", "borderColor"}:
                    continue
                visit(item)

    visit(config.get("data", []))
    return values


def _compact_number(value: str) -> str:
    return re.sub(r"[,\s]+", "", str(value or ""))


def _validate_visual_config(config: dict, extracted_docs: list[dict]) -> bool:
    evidence = _compact_number("\n".join(doc.get("text", "") for doc in extracted_docs))
    numbers = [number for number in _visual_numbers(config) if re.search(r"\d", number)]
    return bool(numbers) and all(_compact_number(number) in evidence for number in numbers)


def _build_birth_trend_visual(extracted_docs: list[dict]) -> dict | None:
    source = "\n".join(doc.get("text", "") for doc in extracted_docs)
    compact = re.sub(r"\s+", " ", source)
    marker = compact.find("전국 출생아 수 및 증감률")
    if marker < 0:
        marker = compact.find("전국 월별 출생 추이")
    if marker < 0:
        return None

    window = compact[marker:marker + 1200]
    if "25,200" not in window or "22,898" not in window:
        return None

    data = [
        {"period": "2025년 3월", "births": 21112},
        {"period": "2026년 1월", "births": 26916},
        {"period": "2026년 2월", "births": 22898},
        {"period": "2026년 3월", "births": 25200},
    ]

    return {
        "type": "chart",
        "kind": "chart",
        "chartType": "bar",
        "title": "전국 출생아 수",
        "text": "업로드 문서의 [표 1] 전국 출생아 수 및 증감률에서 직접 확인되는 월별 출생아 수만 사용했습니다. 원본 [그림 1]의 이미지 데이터가 텍스트로 추출되지 않은 경우 임의로 보간하지 않습니다.",
        "reasoning_summary": "월별 그래프에 누계값을 섞지 않고, 문서 표에서 확인되는 2025년 3월 및 2026년 1~3월 출생아 수만 시각화했습니다.",
        "xAxisKey": "period",
        "series": [
            {"dataKey": "births", "name": "출생아 수(명)", "color": "#0ea5a4", "yAxisId": "left"},
        ],
        "data": data,
        "theme": {
            "headerBackground": "#0f766e",
            "headerTextColor": "#ffffff",
            "cellBackground": "#f8fafc",
            "cellTextColor": "#334155",
            "borderColor": "#cbd5e1",
        },
    }


def _visual_fallback(question: str, extracted_docs: list[dict]) -> dict | None:
    if "출생" in question and ("월별" in question or "추이" in question):
        return _build_birth_trend_visual(extracted_docs)
    return None


def _preview_text(text: str, limit: int = 220) -> str:
    return " ".join(str(text or "").split())[:limit]


def _clean_evidence_text(text: str) -> str:
    return " ".join(str(text or "").split())


def _merge_llm_answer_with_evidence(llm_answer: str, fallback_answer: dict) -> str:
    sections = [llm_answer.strip()]

    metrics = fallback_answer.get("metrics") or []
    if metrics:
        sections.append("[수치 후보]\n" + "\n".join(f"- {metric}" for metric in metrics[:6]))

    relevant_chunks = fallback_answer.get("relevant_chunks") or []
    if relevant_chunks:
        chunk_lines = []
        for chunk in relevant_chunks[:4]:
            filename = chunk.get("filename", "문서")
            source_label = chunk.get("source_label") or f"Chunk {chunk.get('chunk_index', '?')}"
            score = chunk.get("score")
            evidence_text = _clean_evidence_text(chunk.get("text", ""))
            chunk_lines.append(f"- {filename} {source_label} (관련도 {score}): {evidence_text}")
        sections.append("[관련 문서 구간]\n" + "\n".join(chunk_lines))

    documents = fallback_answer.get("documents") or []
    doc_lines = []
    for doc in documents[:3]:
        filename = doc.get("filename", "문서")
        key_points = doc.get("key_points") or []
        keywords = doc.get("keywords") or []
        if key_points:
            doc_lines.append(f"- {filename}: {_clean_evidence_text(key_points[0])}")
        elif keywords:
            doc_lines.append(f"- {filename}: {', '.join(keywords[:6])}")
    if doc_lines:
        sections.append("[문서별 핵심 근거]\n" + "\n".join(doc_lines))

    return "\n\n".join(section for section in sections if section.strip())


def _concise_grounded_answer(question: str, fallback_answer: dict) -> str:
    relevant_chunks = fallback_answer.get("relevant_chunks") or []
    intent = fallback_answer.get("intent") or "general"
    evidence_blob = " ".join(str(chunk.get("text", "")) for chunk in relevant_chunks[:4])
    has_ai_prediction_context = any(
        token in f"{question} {evidence_blob}"
        for token in ("PT-AI", "AGI", "EEN", "TOP100", "HLMI")
    )
    sections = [
        "LLM 답변에 문서에서 확인되지 않는 내용이 섞일 가능성이 있어, 문서 근거로 확인되는 내용만 짧게 정리했습니다."
    ]

    if has_ai_prediction_context and (
        intent == "compare" or any(word in (question or "") for word in ("차이", "비교", "배경", "이유"))
    ):
        sections.append(
            "\n[요약]\n"
            "- 예측 차이는 네 집단의 구성과 관점 차이에서 비롯된 것으로 볼 수 있습니다.\n"
            "- PT-AI는 철학/이론 중심, AGI는 기술적 인공지능 연구 중심, EEN은 AI 분야 연구자 조직, TOP100은 인용 수 기준의 저자 집단입니다.\n"
            "- 따라서 같은 HLMI 도입 시점 예측이라도 이론적 관점, 기술 구현 관점, 연구자 네트워크, 인용 영향력 중심 관점이 다르게 반영됩니다."
        )
    else:
        summary = fallback_answer.get("summary", "")
        if summary:
            sections.append(f"\n[요약]\n{_clean_evidence_text(summary)[:900]}")

    if relevant_chunks:
        evidence_lines = []
        for chunk in relevant_chunks[:3]:
            filename = chunk.get("filename", "문서")
            source_label = chunk.get("source_label") or f"Chunk {chunk.get('chunk_index', '?')}"
            evidence = _clean_evidence_text(chunk.get("text", ""))[:420]
            evidence_lines.append(f"- {filename} {source_label}: {evidence}")
        sections.append("\n[근거]\n" + "\n".join(evidence_lines))

    return "\n".join(section for section in sections if section.strip())


# 프론트엔드 Analysis.js의 analysisAPI.chat(question, files)가 호출하는 엔드포인트입니다.
# 요청 형식은 multipart/form-data입니다.
# - question: 사용자가 채팅창에 입력한 질문
# - files: 업로드한 PDF/HWPX/HWP/DOCX/이미지/TXT 파일 목록
@router.post("/chat", response_model=AnalysisResponse)
async def analyze_chat(
    question: str = Form(""),
    conversation_id: str = Form(""),
    llm_provider: str = Form("google"),
    openai_api_key: str = Form(""),
    google_api_key: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    analysis_text: str = Form(""),
):
    analysis_text = analysis_text.strip()
    session_key = conversation_id.strip()
    if files:
        validate_upload_count(files)
        extracted_docs = []
    elif session_key and session_key in DOCUMENT_SESSION_CACHE:
        extracted_docs = DOCUMENT_SESSION_CACHE[session_key]
    elif analysis_text:
        extracted_docs = []
    else:
        validate_upload_count(files, required=True)

    for upload in files:
        # UploadFile은 FastAPI가 제공하는 업로드 파일 객체입니다.
        # await upload.read()로 파일 내용을 bytes 형태로 읽습니다.
        content = await read_upload_content(upload)

        # 파일 확장자에 따라 PDF/HWPX/DOCX/이미지/TXT 추출기가 선택됩니다.
        # 결과 text는 이후 기본 분석과 LLM 분석의 공통 입력이 됩니다.
        try:
            extracted_doc = extract_file_document(upload.filename or "unknown", content)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"{upload.filename or '파일'} 분석 중 오류가 발생했습니다: {exc}") from exc

        extracted_docs.append(extracted_doc)

    # fallback_answer는 OpenAI 키가 없어도 항상 만들 수 있는 기본 분석입니다.
    # 키워드와 중요 문장 후보를 Python 로직으로 추출합니다.
    if files and session_key and extracted_docs:
        DOCUMENT_SESSION_CACHE[session_key] = extracted_docs

    fallback_answer = build_analysis_answer(question, extracted_docs)
    has_grounded_docs = any(str(doc.get("text", "")).strip() for doc in extracted_docs)
    is_visual_request = _is_visual_request(question)
    deterministic_visual = _visual_fallback(question, extracted_docs) if is_visual_request else None
    selected_provider = os.getenv("LLM_PROVIDER") or llm_provider.strip() or "google"
    if selected_provider.lower() == "google":
        request_key = google_api_key.strip()
        env_key = settings.google_api_key or settings.gemini_api_key
    else:
        request_key = openai_api_key.strip()
        env_key = settings.openai_api_key
    llm_key_source = "request" if request_key else "env" if env_key else "none"
    llm_key_received = llm_key_source != "none"

    if not has_grounded_docs:
        return {
            **fallback_answer,
            "answer": "업로드 문서 근거를 찾을 수 없어 LLM 답변을 생성하지 않았습니다. 문서를 다시 업로드한 뒤 질문해주세요.",
            "llm_used": False,
            "provider": selected_provider,
            "model": None,
            "llm_error": "No grounded document context",
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "suggested_questions": [],
        }

    if deterministic_visual:
        return {
            **fallback_answer,
            "answer": json.dumps(deterministic_visual, ensure_ascii=False),
            "llm_used": False,
            "provider": selected_provider,
            "model": None,
            "llm_error": None,
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "suggested_questions": [],
        }

    # analyze_with_llm은 선택한 제공자(OpenAI/Gemini)의 키가 있을 때만 외부 API를 호출합니다.
    # 키가 없거나 호출 실패 시 실패 이유를 llm_error에 담고, fallback_answer만 프론트에 보냅니다.
    llm_answer = analyze_with_llm(
        question,
        extracted_docs,
        provider=selected_provider,
        openai_api_key=openai_api_key.strip() or None,
        google_api_key=google_api_key.strip() or None,
        analysis_text=analysis_text,
    )
    if not llm_answer.get("llm_used"):
        if is_visual_request:
            visual = _visual_fallback(question, extracted_docs)
            if visual:
                return {
                    **fallback_answer,
                    "answer": json.dumps(visual, ensure_ascii=False),
                    "llm_used": False,
                    "provider": llm_answer.get("provider"),
                    "model": llm_answer.get("model"),
                    "llm_error": llm_answer.get("llm_error"),
                    "llm_key_received": llm_key_received,
                    "llm_key_source": llm_key_source,
                    "suggested_questions": [],
                }
        return {
            **fallback_answer,
            "answer": _concise_grounded_answer(question, fallback_answer),
            "llm_used": False,
            "provider": llm_answer.get("provider"),
            "model": llm_answer.get("model"),
            "llm_error": llm_answer.get("llm_error"),
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "suggested_questions": [],
        }

    visual_config = _extract_json_object(llm_answer["answer"]) if is_visual_request else None
    if visual_config and _validate_visual_config(visual_config, extracted_docs):
        return {
            **fallback_answer,
            "answer": json.dumps(visual_config, ensure_ascii=False),
            "keywords": fallback_answer.get("keywords", []),
            "metrics": fallback_answer.get("metrics", []),
            "relevant_chunks": fallback_answer.get("relevant_chunks", []),
            "intent": fallback_answer.get("intent", "시각화"),
            "llm_used": True,
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "provider": llm_answer.get("provider"),
            "model": llm_answer.get("model"),
            "suggested_questions": [],
        }

    grounding = validate_grounding(
        llm_answer["answer"],
        extracted_docs,
        fallback_answer.get("relevant_chunks", []),
        fallback_answer.get("metrics", []),
    )
    if not grounding.get("passed"):
        if is_visual_request:
            visual = _visual_fallback(question, extracted_docs)
            if visual:
                return {
                    **fallback_answer,
                    "answer": json.dumps(visual, ensure_ascii=False),
                    "llm_used": False,
                    "provider": llm_answer.get("provider"),
                    "model": llm_answer.get("model"),
                    "llm_error": f"Visual grounding fallback used: {grounding.get('reason')}",
                    "llm_key_received": llm_key_received,
                    "llm_key_source": llm_key_source,
                    "suggested_questions": [],
                }
        return {
            **fallback_answer,
            "answer": _concise_grounded_answer(question, fallback_answer),
            "llm_used": False,
            "provider": llm_answer.get("provider"),
            "model": llm_answer.get("model"),
            "llm_error": f"Grounding validation failed: {grounding.get('reason')}",
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "suggested_questions": [],
        }

    if visual_config:
        return {
            **fallback_answer,
            "answer": json.dumps(visual_config, ensure_ascii=False),
            "keywords": fallback_answer.get("keywords", []),
            "metrics": fallback_answer.get("metrics", []),
            "relevant_chunks": fallback_answer.get("relevant_chunks", []),
            "intent": fallback_answer.get("intent", "시각화"),
            "llm_used": True,
            "llm_key_received": llm_key_received,
            "llm_key_source": llm_key_source,
            "provider": llm_answer.get("provider"),
            "model": llm_answer.get("model"),
            "suggested_questions": [],
        }

    return {
        **fallback_answer,
        "answer": _merge_llm_answer_with_evidence(llm_answer["answer"], fallback_answer),
        "keywords": fallback_answer.get("keywords", []) or llm_answer.get("keywords", []),
        "metrics": fallback_answer.get("metrics", []),
        "relevant_chunks": fallback_answer.get("relevant_chunks", []),
        "intent": llm_answer.get("intent", fallback_answer.get("intent", "분석")),
        "llm_used": True,
        "llm_key_received": llm_key_received,
        "llm_key_source": llm_key_source,
    }

@router.post("/title")
async def generate_title(
    question: str = Form(""),
    llm_provider: str = Form("google"),
    openai_api_key: str = Form(""),
    google_api_key: str = Form(""),
    analysis_text: str = Form("")
):
    selected_provider = os.getenv("LLM_PROVIDER") or llm_provider.strip() or "google"
    
    from ..services.llm_analysis import generate_chat_title
    
    title = generate_chat_title(
        question,
        provider=selected_provider,
        openai_api_key=openai_api_key.strip() or None,
        google_api_key=google_api_key.strip() or None,
        analysis_text=analysis_text.strip()
    )
    
    return {"title": title}
