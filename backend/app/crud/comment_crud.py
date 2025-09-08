from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.models.post import Post
from app.schemas.comment_schema import CommentCreate, CommentUpdate
from sqlalchemy.orm import joinedload
from fastapi import HTTPException


def create_comment(db: Session, comment: CommentCreate, user_id: int, post_id: int):
    db_post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or inactive")
    db_comment = Comment(content=comment.content, user_id=user_id, post_id=post_id, is_approved=True)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment, attribute_names=["user"])
    return db_comment

def get_comments_by_post(db: Session, post_id: int, skip: int = 0, limit: int = 5):
    db_post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not db_post:
        return []
    return (
        db.query(Comment)
        .filter(Comment.post_id == post_id, Comment.is_approved == True)
        .options(joinedload(Comment.user))
        .order_by(Comment.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_comment(db: Session, db_comment: Comment, updates: CommentUpdate):
    db_comment.content = updates.content or db_comment.content
    db_comment.is_approved = True
    db.commit()
    db.refresh(db_comment, attribute_names=["user"])
    return db_comment

def delete_comment(db: Session, db_comment: Comment):
    db.delete(db_comment)
    db.commit()

def approve_comment(db: Session, db_comment: Comment):
    db_comment.is_approved = True
    db.commit()
    db.refresh(db_comment, attribute_names=["user"])
    return db_comment