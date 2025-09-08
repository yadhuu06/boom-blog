from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from app.schemas.user_schema import UserResponse
from app.schemas.post_schema import PostResponse
from app.schemas.comment_schema import CommentResponse
from app.crud.post_crud import toggle_post_active
from app.crud.comment_crud import approve_comment, delete_comment

router = APIRouter(tags=["Admin"])

class PaginatedUsersResponse(BaseModel):
    users: List[UserResponse]
    total: int

class PaginatedPostsResponse(BaseModel):
    posts: List[PostResponse]
    total: int

class PaginatedCommentsResponse(BaseModel):
    comments: List[CommentResponse]
    total: int

@router.get("/users", response_model=PaginatedUsersResponse)
def get_all_users(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    users = db.query(User).offset(skip).limit(limit).all()
    total = db.query(User).count()
    return {"users": users, "total": total}

@router.get("/posts", response_model=PaginatedPostsResponse)
def get_all_posts(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    posts = db.query(Post).offset(skip).limit(limit).all()  # Show all posts for admins
    total = db.query(Post).count()
    return {"posts": posts, "total": total}

@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if db_user.id == user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot toggle own active status")
    db_user.is_active = not db_user.is_active
    db.commit()
    db.refresh(db_user)
    return db_user

@router.put("/posts/{post_id}/toggle-active", response_model=PostResponse)
def toggle_post_active_route(
    post_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return toggle_post_active(db, post_id)

@router.get("/comments", response_model=PaginatedCommentsResponse)
def get_all_comments(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    comments = db.query(Comment).offset(skip).limit(limit).all()
    total = db.query(Comment).count()
    return {"comments": comments, "total": total}

@router.put("/comments/{comment_id}/toggle-approve", response_model=CommentResponse)
def toggle_comment_approve(
    comment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    db_comment.is_approved = not db_comment.is_approved
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_admin(
    comment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    db.delete(db_comment)
    db.commit()