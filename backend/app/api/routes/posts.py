
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.schemas.post_schema import PostCreate, PostUpdate, PostResponse
from app.crud.post_crud import (
    create_post, get_post_by_id, get_all_posts, update_post, delete_post,
    toggle_like
)
from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.post import Post
from app.utils.cloudinary_service import upload_to_cloudinary

router = APIRouter()


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    title: str = Form(...), 
    content: str = Form(...),  
    image: UploadFile = File(None),  
    db: Session = Depends(get_db),  
    user=Depends(get_current_user)  
):
    
    if len(title) > 80:
        raise HTTPException(status_code=400, detail="Title must be 80 characters or less")
    
    
    image_url = None
    if image:
   
        image_url = upload_to_cloudinary(image, folder="Boom")

 
    post = PostCreate(title=title, content=content, image_url=image_url)
    return create_post(db, post, author_id=user.id)

# List all posts with pagination
@router.get("/", response_model=List[PostResponse])
def read_all_posts(
    skip: int = 0,  
    limit: int = 10,  
    db: Session = Depends(get_db)
):
    return get_all_posts(db, skip=skip, limit=limit)

# Get a specific post by ID and increment view count
@router.get("/{post_id}", response_model=PostResponse)
def read_post(
    post_id: int,   
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    db_post = get_post_by_id(db, post_id, user_id=user.id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

# Update an existing post
@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Check if post exists
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    

    if title and len(title) > 80:
        raise HTTPException(status_code=400, detail="Title must be 80 characters or less")

    image_url = None
    if image:
        image_url = upload_to_cloudinary(image, folder="Boom")

    updates = PostUpdate(title=title, content=content, image_url=image_url)
    return update_post(db, db_post, updates)

# Delete a post
@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_post(
    post_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    db_post = db.query(Post).filter(Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    delete_post(db, db_post)
    return None

# Toggle like/unlike on a post
@router.post("/{post_id}/like")
def like_or_unlike(
    post_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    updated_like_count, is_liked = toggle_like(db, post_id, user.id)
    return {"like_count": updated_like_count, "is_liked": is_liked}
