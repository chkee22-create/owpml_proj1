import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# .env 파일이 있으면 MONGO_URL, MONGO_DB_NAME 같은 설정을 먼저 읽습니다.
load_dotenv()

# 환경 변수가 없을 경우 로컬 MongoDB를 기본값으로 사용합니다.
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "papermate")

# Motor는 FastAPI에서 쓰기 좋은 비동기 MongoDB 클라이언트입니다.
client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]

async def ensure_indexes():
    """자주 검색하는 필드에 인덱스를 걸어 MongoDB 조회 속도를 안정화합니다."""
    await db.users.create_index("username", unique=True)
    await db.projects.create_index([("user_id", 1), ("project.id", 1)], unique=True)
    await db.projects.create_index("project.inviteCode")
    await db.projects.create_index("updated_at")

async def ping_database():
    """서버 health check에서 MongoDB 연결 상태를 확인할 때 사용합니다."""
    await client.admin.command("ping")
    return {"database": MONGO_DB_NAME, "connected": True}
