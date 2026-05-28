# 초보자 안내: OpenAI 또는 Gemini 같은 외부 AI API를 호출해 더 자연스러운 분석 답변을 만드는 서비스입니다.

import os

from app.services.document_analysis import rank_relevant_chunks



MAX_CONTEXT_CHARS = 18000


def _clip(text: str, limit: int = MAX_CONTEXT_CHARS) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n[문서가 길어 일부만 분석에 사용되었습니다.]"


def _build_ranked_document_context(question: str, extracted_docs: list[dict]) -> str:
    ranked_chunks = rank_relevant_chunks(question, extracted_docs, 8)
    if ranked_chunks:
        blocks = []
        for index, chunk in enumerate(ranked_chunks, start=1):
            blocks.append(
                "\n".join(
                    [
                        f"[관련 구간 {index}]",
                        f"파일명: {chunk.get('filename', 'unknown')}",
                        f"형식: {chunk.get('format', 'unknown')}",
                        f"구간: {chunk.get('chunk_index')}",
                        f"관련도: {chunk.get('score')}",
                        "본문:",
                        _clip(chunk.get("text", ""), 3000),
                    ]
                )
            )
        return _clip("\n\n".join(blocks))

    blocks = []
    for index, doc in enumerate(extracted_docs, start=1):
        blocks.append(
            "\n".join(
                [
                    f"[문서 {index}]",
                    f"파일명: {doc.get('filename', 'unknown')}",
                    f"형식: {doc.get('format', 'unknown')}",
                    "본문:",
                    _clip(doc.get("text", ""), 6000),
                ]
            )
        )
    return _clip("\n\n".join(blocks))


def _build_prompts(question: str, extracted_docs: list[dict], analysis_text: str = "") -> tuple[str, str]:
    document_context = _build_ranked_document_context(question, extracted_docs)
    if not document_context and analysis_text:
        document_context = f"[이전 분석 요약 내용]\n{analysis_text}"
        
    system_prompt = (
        "당신은 논문, 비즈니스 문서, 보고서 등 다양한 문서의 분석 및 협업을 돕는 최고 수준의 AI 연구 어시스턴트 'PaperMate'입니다.\n\n"
        "[기본 원칙]\n"
        "1. 철저한 근거 기반: 사용자가 제공한 문서(Context)나 이전 분석 요약 내용 내에서만 답변하십시오. 외부 지식이나 환각(Hallucination)을 섞지 마십시오.\n"
        "2. 명확한 출처: 사실이나 수치를 인용할 때는 항상 문장 끝에 [파일명]을 기재하십시오.\n"
        "3. 전문적인 톤앤매너: 객관적이고 전문적이지만, 누구나 이해하기 쉬운 설명 방식을 채택하십시오.\n"
        "4. 가독성 극대화: 긴 답변은 마크다운(Markdown), 굵은 글씨, 불릿 포인트를 활용하여 구조화하십시오.\n\n"
        "[기능적 지시사항]\n"
        "- 요약 요청 시: 업로드된 문서의 성격(학술 논문, 비즈니스 보고서, 회의록, 기사 등)을 파악하여 가장 적합한 3~4개의 핵심 항목으로 구조화하여 요약하십시오.\n"
        "  각 항목 앞에는 내용에 어울리는 직관적인 이모지를 붙이십시오.\n"
        "- 시각화(표/그래프/마인드맵) 데이터 요청 시: AI가 데이터의 성격을 분석하여 가장 직관적인 시각화 형태(table, bar, line, pie, mindmap)를 스스로 결정하고, 아래의 '표준 JSON 스키마' 형식을 엄격하게 지켜 응답하십시오. **절대로 부연 설명이나 마크다운 코드블록(```json) 없이 순수 JSON 객체(Object) 단 하나만 반환하십시오.**\n\n"
        "  [표준 JSON 스키마 구조]\n"
        "  {\n"
        "    \"type\": \"chart\",  // chart, table, mindmap 중 택1\n"
        "    \"theme\": {          // AI가 스스로 선택한 테마 디자인 (선택사항, 색상은 HEX 코드)\n"
        "      \"headerBackground\": \"#1e293b\",\n"
        "      \"headerTextColor\": \"#ffffff\",\n"
        "      \"cellBackground\": \"#f8fafc\",\n"
        "      \"cellTextColor\": \"#334155\",\n"
        "      \"borderColor\": \"#cbd5e1\"\n"
        "    },\n"
        "    \"chartType\": \"line\",  // chart인 경우 필수: bar, line, pie 중 택1\n"
        "    \"xAxisKey\": \"name\", // chart인 경우 X축으로 사용할 기준 컬럼명 (pie인 경우 nameKey로 사용됨)\n"
        "    \"columns\": [        // table인 경우 필수 (표의 헤더 및 순서 정의)\n"
        "      {\"key\": \"model\", \"label\": \"AI 모델\"},\n"
        "      {\"key\": \"score\", \"label\": \"정확도\"}\n"
        "    ],\n"
        "    \"series\": [         // chart인 경우 필수 (표시할 데이터 종류 및 색상 정의, 다중 데이터 지원!)\n"
        "      {\"dataKey\": \"score\", \"color\": \"#0ea5a4\", \"name\": \"정확도 점수\", \"yAxisId\": \"left\"},\n"
        "      {\"dataKey\": \"speed\", \"color\": \"#f59e0b\", \"name\": \"처리 속도\", \"yAxisId\": \"right\"} // 데이터 단위(Scale)가 전혀 다를 경우 반드시 right 사용!\n"
        "    ],\n"
        "    \"data\": [           // 실제 데이터 배열 (모든 type 공통)\n"
        "      {\"name\": \"GPT-4\", \"model\": \"GPT-4\", \"score\": 95, \"speed\": 800000},\n"
        "      {\"name\": \"Claude 3\", \"model\": \"Claude 3\", \"score\": 94, \"speed\": 850000}\n"
        "    ]\n"
        "  }\n"
        "  * 주의: 이 JSON 스키마를 사용하여 AI가 다중 비교, 복잡한 표, 파이 차트 등을 완전히 자유롭게 기획하십시오. 특히 theme 객체를 활용하여 표의 시각적 디자인(다크모드, 파스텔톤 등)까지 직접 결정하십시오.\n"
        "  * 꿀팁: 두 데이터의 단위가 너무 차이 나는 경우(예: 하나는 1.5%이고 하나는 500,000명), 반드시 하나의 series에는 'yAxisId: \"left\"', 다른 series에는 'yAxisId: \"right\"'를 주어 듀얼 축(Dual Axis) 차트로 생성하세요!\n\n"
        "응답의 제일 마지막 줄에는 항상 '===SUGGESTED_QUESTIONS===' 이라는 구분선을 넣고, "
        "그 아래에 사용자가 이어서 질문하면 좋을 만한 추천 질문을 2~3개 작성하십시오.\n\n"
        "[추천 질문 작성 시 엄격한 규칙]\n"
        "- 🚨 1순위 규칙: **당신(AI)이 스스로 생각했을 때 제공된 문서(Context)만으로 100% 완벽하게 답변할 수 있는 질문**만 생성하십시오.\n"
        "- 🚨 2순위 규칙: 만약 사용자의 질문에 대해 '문서에서 찾을 수 없다'고 답변했다면, 그 찾을 수 없는 내용과 관련된 꼬리물기 질문은 **절대** 생성하지 마십시오. 대신 문서 내에서 확실히 답할 수 있는 완전히 다른 주제의 흥미로운 질문을 제안하십시오.\n"
        "- 문서에 없는 내용, 단순한 추측, 외부 지식이 필요한 질문은 무조건 배제하십시오.\n"
        "- 추천 질문 예시: '제공된 문서에 등장하는 A 모델과 B 모델의 성능 차이를 표로 비교해 줄래?', "
        "'이 문서에서 제안하는 3가지 해결 방안은 무엇인가요?'"
    )

    if question and question.strip():
        user_prompt = f"""
업로드 문서 내용:
{document_context}

사용자 요청:
{question}

위 사용자 요청에 맞게 문서 내용을 바탕으로 답변을 작성해줘. 사용자가 표, 그래프 데이터, 요약 등 특정 형식을 요구했다면 그 형식에 맞춰서 제공해줘.
"""
    else:
        user_prompt = f"""
업로드 문서 내용:
{document_context}

문서의 전반적인 내용을 아래 형식에 맞춰서 꼼꼼하게 분석해줘.

1. 핵심 내용 요약
2. 실험 결과 및 수치
3. 문서 간 차이점 (여러 문서일 경우)
4. 중요 내용/인용 후보
5. 추가로 확인해야 할 점
"""
    return system_prompt, user_prompt


def _llm_error(message: str, provider: str, model: str | None = None) -> dict:
    return {
        "answer": "",
        "llm_used": False,
        "provider": provider,
        "model": model,
        "llm_error": message,
    }


def _parse_suggested_questions(answer: str) -> tuple[str, list[str]]:
    parts = answer.split("===SUGGESTED_QUESTIONS===")
    main_answer = parts[0].strip()
    questions = []
    if len(parts) > 1:
        raw_qs = parts[1].strip().split("\n")
        for q in raw_qs:
            cleaned = q.strip().lstrip("-").lstrip("*").lstrip("0123456789. ").strip()
            if cleaned:
                questions.append(cleaned)
    return main_answer, questions


def _analyze_with_openai(question: str, extracted_docs: list[dict], api_key: str, analysis_text: str = "") -> dict:
    try:
        from openai import OpenAI
    except ModuleNotFoundError:
        return _llm_error("openai 패키지가 설치되어 있지 않습니다.", "openai")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    client = OpenAI(api_key=api_key)
    system_prompt, user_prompt = _build_prompts(question, extracted_docs, analysis_text)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as exc:
        return _llm_error(f"OpenAI 호출 실패: {exc}", "openai", model)

    if not answer:
        return _llm_error("OpenAI가 빈 답변을 반환했습니다.", "openai", model)

    main_answer, questions = _parse_suggested_questions(answer)

    return {
        "answer": main_answer,
        "suggested_questions": questions,
        "llm_used": True,
        "model": model,
        "provider": "openai",
    }


def _analyze_with_google(question: str, extracted_docs: list[dict], api_key: str, analysis_text: str = "") -> dict:
    try:
        from google import genai
    except ModuleNotFoundError:
        return _llm_error("google-genai 패키지가 설치되어 있지 않습니다.", "google")

    model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    system_prompt, user_prompt = _build_prompts(question, extracted_docs, analysis_text)
    prompt = f"{system_prompt}\n\n{user_prompt}"

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(model=model, contents=prompt)
        answer = (getattr(response, "text", "") or "").strip()
    except Exception as exc:
        return _llm_error(f"Gemini 호출 실패: {exc}", "google", model)

    if not answer:
        return _llm_error("Gemini가 빈 답변을 반환했습니다.", "google", model)

    main_answer, questions = _parse_suggested_questions(answer)

    return {
        "answer": main_answer,
        "suggested_questions": questions,
        "llm_used": True,
        "model": model,
        "provider": "google",
    }


def analyze_with_llm(
    question: str,
    extracted_docs: list[dict],
    provider: str = "openai",
    openai_api_key: str | None = None,
    google_api_key: str | None = None,
    analysis_text: str = "",
) -> dict:
    normalized_provider = (provider or "openai").lower()

    if normalized_provider == "google":
        api_key = google_api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return _llm_error("Google/Gemini API 키가 없어 기본 문서 추출로 응답했습니다.", "google")
        return _analyze_with_google(question, extracted_docs, api_key, analysis_text)

    api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _llm_error("OpenAI API 키가 없어 기본 문서 추출로 응답했습니다.", "openai")
    return _analyze_with_openai(question, extracted_docs, api_key, analysis_text)


def generate_chat_title(
    question: str,
    provider: str = "openai",
    openai_api_key: str | None = None,
    google_api_key: str | None = None,
    analysis_text: str = ""
) -> str:
    """사용자의 첫 질문을 바탕으로 3~5단어의 짧은 제목을 생성합니다."""
    prompt = f"다음 질문(또는 분석 요청)을 바탕으로 대화방의 제목을 3~5단어 내외의 짧은 명사형으로 작성해.\n\n질문: {question}\n\n오직 제목만 출력할 것."
    
    normalized_provider = (provider or "openai").lower()

    if normalized_provider == "google":
        api_key = google_api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            return question[:20]
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
            response = client.models.generate_content(model=model, contents=prompt)
            return (getattr(response, "text", "") or "").strip().replace('"', '').replace("'", "")
        except Exception:
            return question[:20]

    api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return question[:20]
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=20
        )
        return response.choices[0].message.content.strip().replace('"', '').replace("'", "")
    except Exception:
        return question[:20]
