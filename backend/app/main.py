from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from app.db.database import Base, engine 

import os
from alembic.config import Config
from alembic import command

def run_migrations():
    alembic_ini_path = os.path.join(os.path.dirname(__file__), "../alembic.ini")
    if os.path.exists(alembic_ini_path):
        try:
            alembic_cfg = Config(alembic_ini_path)
            command.upgrade(alembic_cfg, "head")
            print("Alembic migrations applied successfully.")
            return
        except Exception as e:
            print(f"Alembic migration failed: {e}. Falling back to create tables.")

    Base.metadata.create_all(bind=engine)
    print("Tables created using SQLAlchemy Base.metadata.create_all().")



run_migrations()

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
