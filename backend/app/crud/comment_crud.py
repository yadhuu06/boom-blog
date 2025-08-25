# comment_crud.py
from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.schemas.comment_schema import CommentCreate, CommentUpdate
from typing import List, Optional

def create_comment(db: Session, comment: CommentCreate, user_id: int, post_id: int) -> Comment:
    db_comment = Comment(**comment.dict(), user_id=user_id, post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_by_post(db: Session, post_id: int) -> List[Comment]:
    return db.query(Comment).filter(Comment.post_id == post_id).all()

def update_comment(db: Session, db_comment: Comment, updates: CommentUpdate) -> Comment:
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_comment, key, value)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, db_comment: Comment) -> None:
    db.delete(db_comment)
    db.commit()
