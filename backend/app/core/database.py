# 초보자 안내: MongoDB 연결, 인덱스 생성, DB 상태 확인을 담당하는 공통 파일입니다.

import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "papermate")

# serverSelectionTimeoutMS를 짧게 두면 MongoDB가 꺼져 있을 때 서버가 오래 멈추지 않습니다.
client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=2000)
db = client[MONGO_DB_NAME]


async def ensure_indexes():
    """자주 조회하는 필드에 인덱스를 만들어 MongoDB 검색을 빠르게 합니다."""
    try:
        await db.users.create_index("username", unique=True)
        await db.projects.create_index([("user_id", 1), ("project.id", 1)], unique=True)
        await db.projects.create_index("project.inviteCode")
        await db.projects.create_index("updated_at")
    except ServerSelectionTimeoutError:
        # MongoDB가 꺼져 있어도 문서 분석처럼 DB가 필요 없는 기능은 계속 사용할 수 있게 합니다.
        return False
    return True


async def ping_database():
    """health check에서 MongoDB 연결 상태를 보여주기 위한 함수입니다."""
    try:
        await client.admin.command("ping")
    except PyMongoError as exc:
        return {"database": MONGO_DB_NAME, "connected": False, "error": str(exc)}
    return {"database": MONGO_DB_NAME, "connected": True}
