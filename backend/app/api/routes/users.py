from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from app.crud.user_crud import create_user, get_user_by_id, get_all_users, update_user, delete_user
from app.core.database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# ----------- Create a new user ----------- #
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user with hashed password.
    """
    db_user = create_user(db, user)
    if not db_user:
        raise HTTPException(status_code=400, detail="User could not be created")
    return db_user


# ----------- Get all users ----------- #
@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all users with pagination.
    """
    return get_all_users(db, skip=skip, limit=limit)


# ----------- Get user by ID ----------- #
@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a user by their ID.
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# ----------- Update user ----------- #
@router.put("/{user_id}", response_model=UserResponse)
def update_existing_user(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):
    """
    Update an existing user partially or fully.
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db, db_user, updates)


# ----------- Delete user ----------- #
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user by their ID.
    """
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user(db, db_user)
    return None
