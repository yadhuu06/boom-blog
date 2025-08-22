from sqlalchemy.orm import Session
from passlib.context import CryptContext
from typing import List, Optional

from app.models.user import User
from app.schemas.user_schema import UserCreate, UserUpdate

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ----------- Utility Functions ----------- #
def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


# ----------- CRUD Functions ----------- #
def create_user(db: Session, user: UserCreate) -> User:
    """
    Create a new user with hashed password and return the user instance.
    """
    hashed_pw = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        is_active=user.is_active,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Fetch a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Fetch a user by email (useful for authentication)."""
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Fetch all users with optional pagination."""
    return db.query(User).offset(skip).limit(limit).all()


def update_user(db: Session, db_user: User, updates: UserUpdate) -> User:
    """Update user fields partially and commit changes."""
    if updates.username is not None:
        db_user.username = updates.username
    if updates.email is not None:
        db_user.email = updates.email
    if updates.password is not None:
        db_user.hashed_password = hash_password(updates.password)
    if updates.is_active is not None:
        db_user.is_active = updates.is_active
    if updates.is_admin is not None:
        db_user.is_admin = updates.is_admin

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, db_user: User) -> None:
    """Delete a user from the database."""
    db.delete(db_user)
    db.commit()
