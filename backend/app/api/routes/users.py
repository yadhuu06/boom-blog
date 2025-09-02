# users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.user_schema import UserResponse, UserUpdate
from app.crud.user_crud import get_all_users, get_user_by_id, update_user, delete_user
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="", tags=["Users"])

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_all_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_existing_user(user_id: int, updates: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db, user, updates)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    user = get_user_by_id(db, user_id) 
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit() 

    return None


