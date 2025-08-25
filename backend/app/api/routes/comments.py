from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from app.crud.comment_crud import create_comment, get_comments_by_post, update_comment, delete_comment
from app.db.database import get_db
from app.api.dependencies import get_current_user  

# comments.py
from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.schemas.comment_schema import CommentUpdate

router = APIRouter()

@router.post("/{post_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: int, comment: CommentCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Add a new comment to a post.
    """
    return create_comment(db, comment, user_id=user.id, post_id=post_id)

@router.get("/{post_id}", response_model=List[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all comments for a post.
    """
    return get_comments_by_post(db, post_id)


def update_comment(db: Session, db_comment: Comment, updates: CommentUpdate):
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_comment, key, value)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, db_comment: Comment):
    db.delete(db_comment)
    db.commit()
