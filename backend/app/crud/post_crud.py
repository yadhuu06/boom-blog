from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from app.models.post import Post
from app.models.like import Like
from app.models.view import View
from app.schemas.post_schema import PostCreate, PostUpdate
from typing import List, Optional

# ---------------- CREATE POST -----------------
def create_post(db: Session, post: PostCreate, author_id: int) -> Post:
    # Initialize counts to 0 in Post table
    db_post = Post(**post.dict(), author_id=author_id, like_count=0, view_count=0)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

# ---------------- GET SINGLE POST -----------------
def get_post_by_id(db: Session, post_id: int, user_id: Optional[int] = None) -> Optional[Post]:
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        return None

    # Get likes and views from tables for analytics, but counts are already in Post table
    is_liked = False
    if user_id:
        is_liked = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).first() is not None

    # Attach dynamic attribute for response
    db_post.is_liked = is_liked
    return db_post

# ---------------- GET ALL POSTS -----------------
def get_all_posts(db: Session, skip: int = 0, limit: int = 10) -> List[Post]:
    # Fetch posts ordered by creation date
    posts = db.query(Post).offset(skip).limit(limit).all()
    return posts  # counts already in Post table, no N+1 queries

# ---------------- UPDATE POST -----------------
def update_post(db: Session, db_post: Post, updates: PostUpdate) -> Post:
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    db_post.updated_at = func.now()
    db.commit()
    db.refresh(db_post)
    return db_post

# ---------------- DELETE POST -----------------
def delete_post(db: Session, db_post: Post) -> None:
    db.delete(db_post)
    db.commit()

# ---------------- LIKE/VIEW OPERATIONS -----------------
def add_like(db: Session, post_id: int, user_id: int):
    if not db.query(Like).filter(Like.post_id == post_id, Like.user_id == user_id).first():
        like = Like(post_id=post_id, user_id=user_id)
        db.add(like)
       
        db.query(Post).filter(Post.id == post_id).update({Post.like_count: Post.like_count + 1})
        db.commit()

def add_view(db: Session, post_id: int, user_id: int):
    if not db.query(View).filter(View.post_id == post_id, View.user_id == user_id).first():
        view = View(post_id=post_id, user_id=user_id)
        db.add(view)
        
        db.query(Post).filter(Post.id == post_id).update({Post.view_count: Post.view_count + 1})
        db.commit()
