from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.comment import Comment
from app.schemas.comment_schema import CommentCreate, CommentUpdate
from typing import List

def create_comment(db: Session, comment: CommentCreate, user_id: int, post_id: int) -> Comment:
    db_comment = Comment(**comment.dict(), user_id=user_id, post_id=post_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_by_post(db: Session, post_id: int, include_unapproved: bool = False) -> List[Comment]:
    query = db.query(Comment).filter(Comment.post_id == post_id)
    if not include_unapproved:
        query = query.filter(Comment.is_approved == True)
    return query.all()

def update_comment(db: Session, db_comment: Comment, updates: CommentUpdate) -> Comment:
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_comment, key, value)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, db_comment: Comment) -> Comment:
    db_comment.is_approved = False
    db.commit()
    db.refresh(db_comment)
    return db_comment

def approve_comment(db: Session, db_comment: Comment) -> Comment:
    db_comment.is_approved = True
    db.commit()
    db.refresh(db_comment)
    return db_comment
