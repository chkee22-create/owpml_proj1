import os
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from jwt import InvalidTokenError

# 환경 변수 설정
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def hash_password(password: str) -> str:
    """비밀번호 해싱"""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    """비밀번호 검증"""
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, password_hash.encode("utf-8"))

def create_access_token(subject: str) -> str:
    """JWT 액세스 토큰 생성"""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> str:
    """Authorization 헤더로 받은 JWT에서 로그인 사용자 id를 꺼냅니다."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except InvalidTokenError as exc:
        raise ValueError("유효하지 않은 로그인 토큰입니다.") from exc

    subject = payload.get("sub")
    if not subject:
        raise ValueError("로그인 토큰에 사용자 정보가 없습니다.")
    return str(subject)
