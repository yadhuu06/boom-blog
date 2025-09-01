from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas.comment_schema import CommentCreate, CommentUpdate, CommentResponse
from app.crud.comment_crud import create_comment, get_comments_by_post, update_comment, delete_comment, approve_comment
from app.db.database import get_db
from app.api.dependencies import get_current_user  
from app.models.comment import Comment

router = APIRouter()

@router.post("/{post_id}", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Add a new comment to a post."""
    return create_comment(db, comment, user_id=user.id, post_id=post_id)


@router.get("/{post_id}", response_model=List[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    """Retrieve all approved comments for a post."""
    return get_comments_by_post(db, post_id)


@router.put("/{comment_id}", response_model=CommentResponse)
def edit_comment(
    comment_id: int,
    updates: CommentUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Update a comment (owner or admin only)."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if db_comment.user_id != user.id and not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Not allowed to edit this comment")

    return update_comment(db, db_comment, updates)


@router.delete("/{comment_id}", response_model=CommentResponse)
def remove_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Soft delete a comment (sets is_approved=False)."""
    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if db_comment.user_id != user.id and not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Not allowed to delete this comment")

    return delete_comment(db, db_comment)


@router.put("/{comment_id}/approve", response_model=CommentResponse)
def approve_comment_route(
    comment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """Approve a comment (admin only)."""
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Only admin can approve comments")

    db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    return approve_comment(db, db_comment)
