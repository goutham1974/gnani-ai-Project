import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.db import init_db
from backend.app.api.voice import router as voice_router
from backend.app.api.chat import router as chat_router
from backend.app.api.farming import router as farming_router
from backend.app.api.analytics import router as analytics_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rythum_ai")

app = FastAPI(
    title="RYTHUM AI Backend",
    description="Autonomous Multilingual AI Operating System for Indian Farmers powered by Gnani.ai",
    version=settings.VERSION
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For flexible local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing RYTHUM AI Database...")
    init_db()
    logger.info("RYTHUM AI Backend initialized successfully!")

@app.get("/")
def root():
    return {
        "project": "RYTHUM AI",
        "description": "Autonomous Multilingual AI Operating System for Indian Farmers",
        "version": settings.VERSION,
        "gnani_stt": settings.GNANI_STT_MODEL,
        "gnani_tts": settings.GNANI_TTS_MODEL,
        "documentation": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gnani_api_configured": bool(settings.GNANI_API_KEY and not settings.GNANI_API_KEY.startswith("your_")),
        "database": "sqlite_ready",
        "agents": ["Crop Intelligence", "Market Intelligence", "Weather Intelligence", "Autonomous Task Agent", "Verification"]
    }

# Register Routers
app.include_router(voice_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(farming_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

