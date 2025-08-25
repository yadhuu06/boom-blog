from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user_schema import UserResponse

class PostBase(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None

class PostResponse(PostBase):
    id: int
    author_id: int
    created_at: datetime
    updated_at: datetime
    view_count: int 
    like_count: int 
    is_liked: Optional[bool] = None
    author: UserResponse

    class Config:
        orm_mode = True
