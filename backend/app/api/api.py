# api.py
from fastapi import APIRouter
from app.api.routes import users, auth, admin, posts, comments 

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(posts.router, prefix="/posts", tags=["Posts"])      
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])  
