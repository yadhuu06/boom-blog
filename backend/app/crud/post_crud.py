from sqlalchemy.orm import Session
from app.models.post import Post
from app.models.view import View
from app.models.like import Like  
from app.schemas.post_schema import PostCreate, PostUpdate

#  Create Post
def create_post(db: Session, post: PostCreate, author_id: int) -> Post:
    db_post = Post(**post.dict(), author_id=author_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

#  Get all posts
def get_all_posts(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Post).offset(skip).limit(limit).all()

#  Get post by ID
def get_post_by_id(db: Session, post_id: int, user_id: int = None):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None

    if user_id:
        add_view(db, post_id, user_id)

    return post

#  Update Post
def update_post(db: Session, db_post: Post, updates: PostUpdate) -> Post:
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    db.commit()
    db.refresh(db_post)
    return db_post

#  Delete Post
def delete_post(db: Session, db_post: Post) -> None:
    db.delete(db_post)
    db.commit()

#  Toggle Like
def toggle_like(db: Session, post_id: int, user_id: int):
    existing_like = db.query(Like).filter_by(post_id=post_id, user_id=user_id).first()
    post = db.query(Post).filter(Post.id == post_id).first()

    if existing_like:
        db.delete(existing_like)
        post.like_count = Post.like_count - 1 if post.like_count > 0 else 0
        is_liked = False
    else:
        new_like = Like(post_id=post_id, user_id=user_id)
        db.add(new_like)
        post.like_count = Post.like_count + 1
        is_liked = True

    db.commit()
    db.refresh(post)
    return post.like_count, is_liked

#  Add View (only once per user)
def add_view(db: Session, post_id: int, user_id: int) -> int:
    existing_view = db.query(View).filter_by(post_id=post_id, user_id=user_id).first()
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        return 0

    if not existing_view:
        new_view = View(post_id=post_id, user_id=user_id)
        db.add(new_view)
        post.view_count = Post.view_count + 1

    db.commit()
    db.refresh(post)
    return post.view_count
