from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from app.db.database import Base, engine
from sqlalchemy import text

# ✅ Import all models so they register with Base
from app.models import comment, like, post, user, view  


def init_db():
    """Ensure schema + tables exist."""
    with engine.connect() as conn:
        # Create schema if not exists
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS boom_blog"))
        conn.commit()

    # Create tables inside schema
    Base.metadata.create_all(bind=engine)
    print("✅ Schema and tables ensured in database.")


# Run DB initialization
init_db()

# FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend Boom Box",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://boom-blog-frontend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": "1.0.0",
        "status": "running"
    }
