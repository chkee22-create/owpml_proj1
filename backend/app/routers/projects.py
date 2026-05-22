from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import db
from app.core.deps import get_current_user_id
from models.schemas import ProjectListPayload, ProjectPayload


router = APIRouter(prefix="/api/projects", tags=["projects"])


def _now():
    return datetime.now(timezone.utc)


def _clean_mongo_doc(doc: dict[str, Any]) -> dict[str, Any]:
    """MongoDB 내부 _id는 프론트에서 쓰지 않으므로 문자열로 바꿔 응답합니다."""
    doc["_id"] = str(doc["_id"])
    return doc


def _get_project_id(project: dict[str, Any]) -> str:
    project_id = str(project.get("id") or "").strip()
    if not project_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="project.id가 필요합니다.")
    return project_id


@router.get("")
async def list_projects(user_id: str = Depends(get_current_user_id)):
    """로그인 사용자의 프로젝트 목록을 MongoDB에서 읽습니다."""
    cursor = db.projects.find({"user_id": user_id}).sort("updated_at", -1)
    docs = [_clean_mongo_doc(doc) async for doc in cursor]
    return {"projects": [doc["project"] for doc in docs]}


@router.put("/sync")
async def sync_projects(
    payload: ProjectListPayload,
    user_id: str = Depends(get_current_user_id),
):
    """브라우저에 있던 프로젝트 배열 전체를 MongoDB에 동기화합니다."""
    incoming_ids = []
    now = _now()

    for project in payload.projects:
        project_id = _get_project_id(project)
        incoming_ids.append(project_id)
        await db.projects.update_one(
            {"user_id": user_id, "project.id": project_id},
            {
                "$set": {
                    "user_id": user_id,
                    "project": project,
                    "invite_code": project.get("inviteCode"),
                    "updated_at": now,
                },
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )

    await db.projects.delete_many({"user_id": user_id, "project.id": {"$nin": incoming_ids}})
    return {"projects": payload.projects}


@router.post("", status_code=status.HTTP_201_CREATED)
async def upsert_project(
    payload: ProjectPayload,
    user_id: str = Depends(get_current_user_id),
):
    """프로젝트 하나를 생성하거나 같은 id의 기존 프로젝트를 갱신합니다."""
    project = payload.project
    project_id = _get_project_id(project)
    now = _now()

    await db.projects.update_one(
        {"user_id": user_id, "project.id": project_id},
        {
            "$set": {
                "user_id": user_id,
                "project": project,
                "invite_code": project.get("inviteCode"),
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    return {"project": project}


@router.get("/invite/{invite_code}")
async def get_project_by_invite(invite_code: str):
    """초대코드로 공유 가능한 프로젝트를 찾습니다."""
    normalized_code = invite_code.strip()
    if not normalized_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="초대코드를 입력해주세요.")

    doc = await db.projects.find_one({"invite_code": normalized_code})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="초대코드에 해당하는 프로젝트가 없습니다.")
    return {"project": doc["project"]}


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """로그인 사용자의 프로젝트 하나를 MongoDB에서 삭제합니다."""
    result = await db.projects.delete_one({"user_id": user_id, "project.id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="삭제할 프로젝트를 찾지 못했습니다.")
