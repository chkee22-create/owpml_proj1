# 초보자 안내: 프론트엔드와 백엔드가 주고받는 데이터 모양을 Pydantic 모델로 정의한 파일입니다.

from typing import Any

from pydantic import BaseModel, Field

class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=40)
    password: str = Field(..., min_length=4, max_length=128)

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=40)
    password: str = Field(..., min_length=4, max_length=128)

class ProfileUpdateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=40)

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=4, max_length=128)
    new_password: str = Field(..., min_length=4, max_length=128)

class AuthUser(BaseModel):
    id: str
    username: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser

class ProjectPayload(BaseModel):
    # 프론트 프로젝트 카드/분석/공유 데이터는 아직 형태가 자주 바뀌므로
    # MongoDB에는 JSON 객체 전체를 저장하고, 화면 안정화 후 세부 스키마를 고정합니다.
    project: dict[str, Any]

class ProjectListPayload(BaseModel):
    projects: list[dict[str, Any]] = Field(default_factory=list)
