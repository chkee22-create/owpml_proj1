import os
from motor.motor_asyncio import AsyncIOMotorClient

# 환경 변수가 없을 경우를 대비한 기본값 설정
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "papermate")

# 클라이언트 생성
client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]

async def ensure_indexes():
    """인덱스 생성 함수"""
    await db.users.create_index("username", unique=True)