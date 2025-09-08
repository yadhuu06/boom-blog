from sqlalchemy.orm import Session
from app.models.user import User
from app.models.post import Post
from fastapi import HTTPException, status

def toggle_user_status(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

def toggle_post_block(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.is_blocked = not post.is_blocked
    db.commit()
    db.refresh(post)
    return post