import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# 수정된 경로에 맞게 절대 경로로 변경
from app.core.database import ensure_indexes, ping_database
from app.routers.analysis import router as analysis_router
from app.routers.auth import router as auth_router
from app.routers.projects import router as projects_router
from app.routers.visuals import router as visuals_router

app = FastAPI(
    title="PaperMate API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

def _cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")
    defaults = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    custom = [origin.strip() for origin in configured.split(",") if origin.strip()]
    return custom or defaults

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
# auth_router는 이미 내부적으로 prefix="/api/auth"를 가지고 있으므로 바로 등록합니다.
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(projects_router)
app.include_router(visuals_router)

# 서버 시작 시 동작
@app.on_event("startup")
async def on_startup():
    await ensure_indexes()

@app.get("/api/health")
async def health_check():
    db_status = await ping_database()
    return {"status": "ok", **db_status}

# 배포 모드: React build 결과 서빙
frontend_build_dir = Path(
    os.getenv(
        "FRONTEND_BUILD_DIR",
        Path(__file__).resolve().parent.parent / "frontend" / "build",
    )
)

if frontend_build_dir.exists():
    static_dir = frontend_build_dir / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(full_path: str):
        # docs 관련 경로는 API 문서 페이지를 위해 React로 보내지 않습니다.
        if full_path in ["docs", "openapi.json", "redoc"]:
            return {"message": "Use /docs for API documentation"}
            
        requested_file = frontend_build_dir / full_path
        if full_path and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(frontend_build_dir / "index.html")
