# api/routes/users.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_users():
    return {"msg": "List of users will come here"}
