from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.security import get_password_hash  # ✅ Correct import

# ----------- CRUD Functions ----------- #

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username or user.email,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, updates: UserUpdate) -> User:
    if updates.username:
        db_user.username = updates.username
    if updates.email:
        db_user.email = updates.email
    if updates.password:
        db_user.hashed_password = get_password_hash(updates.password)  
    if updates.is_active is not None:
        db_user.is_active = updates.is_active
    if updates.is_admin is not None:
        db_user.is_admin = updates.is_admin

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, db_user: User) -> None:
    db.delete(db_user)
    db.commit()
