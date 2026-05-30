import re
from dataclasses import dataclass


_WORD_RE = re.compile(r"[^\W_]{2,}", re.UNICODE)
_NUMBER_RE = re.compile(
    r"(?<![\w])(?:\d{1,3}(?:,\d{3})+|\d+\.\d+|(?:19|20)\d{2}|\d+\s*%)(?![\w])"
)

_STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "into",
    "about",
    "document",
    "context",
    "analysis",
    "summary",
    "user",
    "request",
    "page",
    "file",
    "section",
    "문서",
    "분석",
    "내용",
    "요약",
    "근거",
    "관련",
    "주요",
    "결과",
    "자료",
    "정보",
    "사용자",
    "질문",
}


@dataclass
class GroundingResult:
    passed: bool
    reason: str = ""
    unsupported_numbers: list[str] | None = None
    unsupported_terms: list[str] | None = None

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "reason": self.reason,
            "unsupported_numbers": self.unsupported_numbers or [],
            "unsupported_terms": self.unsupported_terms or [],
        }


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip().lower()


def _compact(text: str) -> str:
    return re.sub(r"[\s,]+", "", str(text or "")).lower()


def _numbers(text: str) -> list[str]:
    seen = set()
    values = []
    for match in _NUMBER_RE.finditer(text or ""):
        value = match.group(0).strip()
        key = _compact(value)
        if key and key not in seen:
            seen.add(key)
            values.append(value)
    return values


def _terms(text: str) -> set[str]:
    terms = set()
    for raw in _WORD_RE.findall(_normalize(text)):
        if raw.isdigit() or raw in _STOPWORDS:
            continue
        if len(raw) < 3:
            continue
        terms.add(raw)
    return terms


def _evidence_text(extracted_docs: list[dict], relevant_chunks: list[dict], metrics: list[str]) -> str:
    parts = []
    parts.extend(str(doc.get("text", "")) for doc in extracted_docs or [])
    parts.extend(str(chunk.get("text", "")) for chunk in relevant_chunks or [])
    parts.extend(str(metric) for metric in metrics or [])
    return "\n".join(part for part in parts if part)


def validate_grounding(
    answer: str,
    extracted_docs: list[dict],
    relevant_chunks: list[dict] | None = None,
    metrics: list[str] | None = None,
) -> dict:
    evidence = _evidence_text(extracted_docs, relevant_chunks or [], metrics or [])
    if not _normalize(evidence):
        return GroundingResult(False, "No document evidence was available.").to_dict()

    compact_evidence = _compact(evidence)
    unsupported_numbers = [
        value for value in _numbers(answer) if _compact(value) not in compact_evidence
    ]
    if unsupported_numbers:
        return GroundingResult(
            False,
            "The answer contains numbers not found in the uploaded documents.",
            unsupported_numbers=unsupported_numbers[:8],
        ).to_dict()

    answer_terms = _terms(answer)
    if not answer_terms:
        return GroundingResult(True).to_dict()

    evidence_terms = _terms(evidence)
    unsupported_terms = sorted(answer_terms - evidence_terms)
    support_ratio = 1 - (len(unsupported_terms) / max(len(answer_terms), 1))

    if len(answer_terms) >= 12 and support_ratio < 0.35:
        return GroundingResult(
            False,
            "The answer has low overlap with uploaded document terms.",
            unsupported_terms=unsupported_terms[:12],
        ).to_dict()

    return GroundingResult(True).to_dict()
