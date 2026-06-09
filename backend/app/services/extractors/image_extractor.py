# 서비스: 이미지 파일 검사, OCR, 멀티모달 이미지 업로드 지원을 담당합니다.
"""Image inspection, OCR, and uploaded-image multimodal metadata."""

import io

from app.services.analysis.answer_builder import _clean_text
from app.services.visual_buttons.image.extraction import summarize_uploaded_image


IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}


def inspect_image(content: bytes) -> str:
    try:
        from PIL import Image
    except ModuleNotFoundError:
        return "이미지 분석을 위해 Pillow 패키지가 필요합니다. requirements.txt 설치 후 다시 시도해주세요."

    image = Image.open(io.BytesIO(content))
    description = f"이미지 파일입니다. 크기: {image.width}x{image.height}px, 형식: {image.format}."

    try:
        import pytesseract
    except ModuleNotFoundError:
        return f"{description} 이미지 속 텍스트까지 발췌하려면 OCR 엔진(pytesseract/Tesseract)이 필요합니다."

    try:
        ocr_text = _clean_text(pytesseract.image_to_string(image, lang="kor+eng"))
    except Exception:
        return f"{description} OCR 실행 파일(Tesseract)이 설치되어 있지 않아 이미지 속 문자는 아직 읽을 수 없습니다."

    if not ocr_text:
        return f"{description} OCR로 읽힌 텍스트가 없습니다."
    return f"{description} OCR 추출 텍스트: {ocr_text}"


def extract_uploaded_image_assets(filename: str, content: bytes) -> list[dict]:
    return summarize_uploaded_image(filename, content, source_label=filename)
