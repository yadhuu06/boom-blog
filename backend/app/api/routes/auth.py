# api/routes/auth.py
from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login():
    return {"msg": "Login functionality will be implemented"}
