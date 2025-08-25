# post.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.post_schema import PostCreate, PostUpdate, PostResponse
from app.crud.post_crud import create_post, get_post_by_id, get_all_posts, update_post, delete_post
from app.db.database import get_db
from app.api.dependencies import get_current_user 

router = APIRouter()

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(post: PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Create a new post for the authenticated user.
    """
    return create_post(db, post, author_id=user.id)

@router.get("/", response_model=List[PostResponse])
def read_all_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Retrieve all posts with pagination.
    """
    return get_all_posts(db, skip=skip, limit=limit)

@router.get("/{post_id}", response_model=PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a post by ID.
    """
    db_post = get_post_by_id(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(post_id: int, updates: PostUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Update an existing post (only author can update).
    """
    db_post = get_post_by_id(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    return update_post(db, db_post, updates)

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_post(post_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    """
    Delete a post (only author can delete).
    """
    db_post = get_post_by_id(db, post_id)
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.author_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    delete_post(db, db_post)
    return None
