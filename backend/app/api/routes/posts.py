from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.post_schema import PostCreate, PostUpdate, PostResponse
from app.crud.post_crud import create_post, get_post_by_id, get_all_posts, update_post, delete_post, toggle_like
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.post import Post
from app.models.user import User  
from app.utils.cloudinary_service import upload_to_cloudinary

router = APIRouter(tags=["Posts"])

class PaginatedPostsResponse(BaseModel):
    posts: List[PostResponse]
    total: int

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is blocked")
    if len(title) > 80:
        raise HTTPException(status_code=400, detail="Title must be 80 characters or less")
    image_url = None
    if image:
        image_url = upload_to_cloudinary(image, folder="Boom")
    post = PostCreate(title=title, content=content, image_url=image_url)
    return create_post(db, post, author_id=user.id)

@router.get("/", response_model=PaginatedPostsResponse)
def read_all_posts(
    skip: int = 0,
    limit: int = 6,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user, use_cache=False)  
):
    is_admin = user.is_admin if user else False
    posts = get_all_posts(db, skip=skip, limit=limit, is_admin=is_admin)
    if is_admin:
        print("admin")
        total = db.query(Post).count()
    else:
        total = db.query(Post).filter(Post.is_active == True).count()
    return {"posts": posts, "total": total}

@router.get("/{post_id}", response_model=PostResponse)
def read_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user, use_cache=False)  
):
    db_post = get_post_by_id(db, post_id, user_id=user.id if user else None)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or inactive")
    return db_post

@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is blocked")
    db_post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or inactive")
    if db_post.author_id != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    if title and len(title) > 80:
        raise HTTPException(status_code=400, detail="Title must be 80 characters or less")
    image_url = db_post.image_url
    if image and image.size > 0:
        image_url = upload_to_cloudinary(image, folder="Boom")
    updates = PostUpdate(title=title, content=content, image_url=image_url)
    return update_post(db, db_post, updates)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is blocked")
    db_post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or inactive")
    if db_post.author_id != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    delete_post(db, db_post)
    return None

@router.post("/{post_id}/like")
def like_or_unlike(
    post_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is blocked")
    db_post = db.query(Post).filter(Post.id == post_id, Post.is_active == True).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found or inactive")
    updated_like_count, is_liked = toggle_like(db, post_id, user.id)
    return {"like_count": updated_like_count, "is_liked": is_liked}