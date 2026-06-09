# 서비스: 영어 기반 분석 텍스트를 한국어로 번역하는 로컬 지원 로직입니다.
"""Optional local translation helpers for user-facing Korean analysis."""

import re
from functools import lru_cache

from app.core.config import settings


ENGLISH_WORD_RE = re.compile(r"\b[A-Za-z][A-Za-z\-]{2,}\b")
KOREAN_RE = re.compile(r"[가-힣]")


def _english_heavy(text: str) -> bool:
    letters = re.findall(r"[A-Za-z가-힣]", text or "")
    if not letters:
        return False
    korean_count = len(KOREAN_RE.findall(text or ""))
    english_count = len(re.findall(r"[A-Za-z]", text or ""))
    return english_count >= 20 and english_count > korean_count * 1.4


def _should_translate_line(line: str) -> bool:
    stripped = line.strip()
    if len(stripped) < 12:
        return False
    if stripped.startswith(("[", "{", "}", "- {", "```")):
        return False
    if re.fullmatch(r"[\[\]가-힣A-Za-z0-9 .,:()/%·_-]+", stripped) is None:
        return False
    return _english_heavy(stripped)


@lru_cache(maxsize=1)
def _argos_translation_ready() -> bool:
    if not settings.enable_local_translation:
        return False

    try:
        import argostranslate.package
        import argostranslate.translate
    except Exception:
        return False

    def has_installed_pair() -> bool:
        for language in argostranslate.translate.get_installed_languages():
            if language.code != "en":
                continue
            return any(translation.to_lang.code == "ko" for translation in language.translations_from)
        return False

    if has_installed_pair():
        return True

    if not settings.local_translation_auto_install:
        return False

    try:
        argostranslate.package.update_package_index()
        packages = argostranslate.package.get_available_packages()
        package = next(
            item for item in packages if item.from_code == "en" and item.to_code == "ko"
        )
        argostranslate.package.install_from_path(package.download())
        return has_installed_pair()
    except Exception:
        return False


def _translate_en_to_ko(text: str) -> str:
    if not _argos_translation_ready():
        return text
    try:
        import argostranslate.translate

        translated = argostranslate.translate.translate(text, "en", "ko").strip()
        return translated or text
    except Exception:
        return text


def ensure_korean_analysis_text(text: str) -> str:
    """Translate English-heavy user-facing analysis paragraphs to Korean.

    This is intentionally conservative: headings, JSON-like data, and already
    Korean paragraphs are preserved. If Argos Translate or its en->ko package is
    unavailable, the original text is returned.
    """

    if not text:
        return text

    output: list[str] = []
    translated_any = False
    for line in str(text).splitlines():
        if _should_translate_line(line):
            translated = _translate_en_to_ko(line)
            output.append(translated)
            translated_any = translated_any or translated != line
        else:
            output.append(line)
    if translated_any:
        return "\n".join(output)
    return "\n".join(output)
