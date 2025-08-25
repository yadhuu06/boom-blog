from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user_schema import UserResponse

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    is_approved: Optional[bool] = None

class CommentResponse(CommentBase):
    id: int
    user_id: int
    post_id: int
    is_approved: bool
    created_at: datetime
    user: UserResponse

    class Config:
        orm_mode = True