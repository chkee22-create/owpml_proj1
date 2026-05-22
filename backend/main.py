from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 수정된 경로에 맞게 절대 경로로 변경
from app.core.database import ensure_indexes, ping_database
from app.routers.analysis import router as analysis_router
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router

app = FastAPI(title="PaperMate API")

# CORS 설정 (그대로 유지)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(projects_router)

# 서버 시작 시 동작
@app.on_event("startup")
async def on_startup():
    await ensure_indexes()

@app.get("/api/health")
async def health_check():
    db_status = await ping_database()
    return {"status": "ok", **db_status}
