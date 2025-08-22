from fastapi import FastAPI
from app.api.api import api_router  # Absolute import for central API router

# ---------------- FastAPI App Initialization ---------------- #
app = FastAPI(
    title="Boom-Blog CMS API",
    version="1.0.0",
    description="A clean, modular FastAPI backend for Boom-Blog CMS"
)

# ---------------- Include API Router ---------------- #
# Centralized router handling all endpoints
app.include_router(api_router)


# ---------------- Root Endpoint ---------------- #
@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint for health check or welcome message.
    """
    return {"message": "Welcome to Boom-Blog CMS API"}
