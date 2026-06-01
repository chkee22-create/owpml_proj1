# 초보자 안내: 회원가입, 로그인, 프로필 수정, 비밀번호 변경 같은 인증 API를 모아둔 파일입니다.

from datetime import datetime, timezone
import json
from urllib.parse import urlencode
from urllib.request import urlopen

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.core.config import settings
from app.core.database import (
    DISCUSSION_COMMENTS_COLLECTION,
    PROJECT_FILES_COLLECTION,
    PROJECT_THREADS_COLLECTION,
    PROJECTS_COLLECTION,
    SHARED_ROOMS_COLLECTION,
    VISUAL_ASSETS_COLLECTION,
    db,
)
from app.core.deps import get_current_user_id
from app.core.security import create_access_token, hash_password, verify_password
from models.schemas import (
    AuthResponse,
    AuthUser,
    GoogleAuthRequest,
    LoginRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    SignupRequest,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _raise_database_error(exc: PyMongoError) -> None:
    """MongoDB 장애를 로그인 화면에서 이해할 수 있는 오류로 바꿉니다."""

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"데이터베이스 연결 또는 처리 중 오류가 발생했습니다: {exc}",
    ) from exc


def serialize_user(user) -> AuthUser:
    return AuthUser(id=str(user["_id"]), username=user.get("display_name") or user["username"])


def _verify_google_id_token(id_token: str) -> dict:
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="서버 .env에 GOOGLE_CLIENT_ID 또는 VITE_GOOGLE_CLIENT_ID가 필요합니다.",
        )

    url = "https://oauth2.googleapis.com/tokeninfo?" + urlencode({"id_token": id_token})
    try:
        with urlopen(url, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google 로그인 토큰을 검증하지 못했습니다.") from exc

    if payload.get("aud") != settings.google_client_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google Client ID가 일치하지 않습니다.")
    if payload.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google 토큰 발급자가 올바르지 않습니다.")
    if payload.get("email_verified") not in {"true", True}:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google 이메일 인증이 완료되지 않은 계정입니다.")
    if not payload.get("sub") or not payload.get("email"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google 계정 정보를 읽지 못했습니다.")
    return payload


async def _unique_google_username(email: str, fallback_name: str) -> str:
    base = (email or fallback_name or "google-user").strip().lower()[:40] or "google-user"
    candidate = base
    suffix = 2
    while await db.users.find_one({"username": candidate}):
        trimmed = base[: max(1, 40 - len(str(suffix)) - 1)]
        candidate = f"{trimmed}-{suffix}"
        suffix += 1
    return candidate


def get_object_id(user_id: str) -> ObjectId:
    try:
        return ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유효하지 않은 사용자입니다.") from exc


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="아이디를 입력해주세요.")

    user_doc = {
        "username": username,
        "display_name": username,
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }

    try:
        result = await db.users.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 아이디입니다.") from exc
    except PyMongoError as exc:
        _raise_database_error(exc)

    user_doc["_id"] = result.inserted_id
    token = create_access_token(str(result.inserted_id))
    return AuthResponse(access_token=token, user=serialize_user(user_doc))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    username = payload.username.strip()
    try:
        user = await db.users.find_one({"username": username})
    except PyMongoError as exc:
        _raise_database_error(exc)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="등록되지 않은 아이디입니다.")

    if not user.get("password_hash"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google로 가입한 계정입니다. Google 로그인을 사용해주세요.")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="비밀번호가 올바르지 않습니다.")

    token = create_access_token(str(user["_id"]))
    return AuthResponse(access_token=token, user=serialize_user(user))


@router.post("/google", response_model=AuthResponse)
async def google_login(payload: GoogleAuthRequest):
    google_user = _verify_google_id_token(payload.id_token)
    google_sub = google_user["sub"]
    email = google_user["email"].strip().lower()
    display_name = (google_user.get("name") or email.split("@")[0] or email).strip()
    now = datetime.now(timezone.utc)

    try:
        user = await db.users.find_one({"google_sub": google_sub})
        if not user:
            user = await db.users.find_one({"email": email})

        if user:
            await db.users.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {
                        "google_sub": google_sub,
                        "email": email,
                        "display_name": user.get("display_name") or display_name,
                        "auth_provider": "google",
                        "last_login_at": now,
                    }
                },
            )
            user.update({
                "google_sub": google_sub,
                "email": email,
                "display_name": user.get("display_name") or display_name,
            })
        else:
            username = await _unique_google_username(email, display_name)
            user = {
                "username": username,
                "display_name": display_name,
                "email": email,
                "google_sub": google_sub,
                "auth_provider": "google",
                "created_at": now,
                "last_login_at": now,
            }
            result = await db.users.insert_one(user)
            user["_id"] = result.inserted_id
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 연결된 Google 계정입니다.") from exc
    except PyMongoError as exc:
        _raise_database_error(exc)

    token = create_access_token(str(user["_id"]))
    return AuthResponse(access_token=token, user=serialize_user(user))


@router.patch("/profile", response_model=AuthUser)
async def update_profile(
    payload: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="닉네임을 입력해주세요.")

    object_id = get_object_id(user_id)
    try:
        user = await db.users.find_one({"_id": object_id})
    except PyMongoError as exc:
        _raise_database_error(exc)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    display_name = username
    try:
        await db.users.update_one({"_id": object_id}, {"$set": {"display_name": display_name}})
    except PyMongoError as exc:
        _raise_database_error(exc)

    user["display_name"] = display_name

    return serialize_user(user)


@router.patch("/password")
async def change_password(
    payload: PasswordChangeRequest,
    user_id: str = Depends(get_current_user_id),
):
    object_id = get_object_id(user_id)
    try:
        user = await db.users.find_one({"_id": object_id})
    except PyMongoError as exc:
        _raise_database_error(exc)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    if not verify_password(payload.current_password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="현재 비밀번호가 올바르지 않습니다.")

    try:
        await db.users.update_one(
            {"_id": object_id},
            {"$set": {"password_hash": hash_password(payload.new_password)}},
        )
    except PyMongoError as exc:
        _raise_database_error(exc)

    return {"message": "비밀번호가 변경되었습니다."}


@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(user_id: str = Depends(get_current_user_id)):
    object_id = get_object_id(user_id)
    try:
        result = await db.users.delete_one({"_id": object_id})
    except PyMongoError as exc:
        _raise_database_error(exc)

    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    try:
        await db[PROJECTS_COLLECTION].delete_many({"user_id": user_id})
        await db[VISUAL_ASSETS_COLLECTION].delete_many({"user_id": user_id})
        await db[DISCUSSION_COMMENTS_COLLECTION].delete_many({"user_id": user_id})
        await db[PROJECT_THREADS_COLLECTION].delete_many({"user_id": user_id})
        await db[PROJECT_FILES_COLLECTION].delete_many({"user_id": user_id})
        await db[SHARED_ROOMS_COLLECTION].delete_many({"created_by": user_id})
    except PyMongoError as exc:
        _raise_database_error(exc)
