from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.view import View
from app.models.like import Like
from app.schemas.post_schema import PostCreate, PostUpdate
from fastapi import HTTPException, status
from sqlalchemy import exists

def create_post(db: Session, post: PostCreate, author_id: int) -> Post:
    db_post = Post(**post.dict(), author_id=author_id, is_active=True)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_all_posts(db: Session, skip: int = 0, limit: int = 6, is_admin: bool = False):
    query = db.query(Post)
    if not is_admin:
        query = query.filter(Post.is_active == True)
    return query.offset(skip).limit(limit).all()
 

def get_post_by_id(db: Session, post_id: int, user_id: int = None):
    post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not post:
        return None

    is_liked = False
    is_viewed = False

    if user_id:

        add_view(db, post_id, user_id)

        is_liked = db.query(
            exists().where(Like.post_id == post_id, Like.user_id == user_id)
        ).scalar()
        is_viewed = db.query(
            exists().where(View.post_id == post_id, View.user_id == user_id)
        ).scalar()

    post.is_liked = is_liked
    post.is_viewed = is_viewed
    return post

def update_post(db: Session, db_post: Post, updates: PostUpdate) -> Post:
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db: Session, db_post: Post) -> None:
    db.delete(db_post)
    db.commit()

def toggle_like(db: Session, post_id: int, user_id: int):
    existing_like = db.query(Like).filter_by(post_id=post_id, user_id=user_id).first()
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if existing_like:
        db.delete(existing_like)
        post.like_count = max(post.like_count - 1, 0)
        is_liked = False
    else:
        new_like = Like(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.like_count += 1
        is_liked = True
    db.commit()
    db.refresh(post)
    return post.like_count, is_liked

def add_view(db: Session, post_id: int, user_id: int) -> int:
    existing_view = db.query(View).filter_by(post_id=post_id, user_id=user_id).first()
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return 0
    if not existing_view:
        new_view = View(post_id=post_id, user_id=user_id)
        db.add(new_view)
        post.view_count += 1
    db.commit()
    db.refresh(post)
    return post.view_count

def toggle_post_active(db: Session, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.is_active = not post.is_active
    db.commit()
    db.refresh(post)
    return post