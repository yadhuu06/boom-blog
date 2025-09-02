
# admin.py
from fastapi import APIRouter

router = APIRouter(prefix="/admin", tags=["Admin"])

# @router.get("/users")
# def list_users():
#     return {"msg": "List of all users"}

# @router.get("/posts")
# def list_posts():
#     return {"msg": "List of all posts"}
