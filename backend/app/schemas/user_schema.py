from pydantic import BaseModel, EmailStr
from typing import Optional

# ----------- Base Schema (common fields) ----------- #
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False



class UserCreate(UserBase):
    password: str   


# ----------- For Updating User ----------- #
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


# ----------- For Response (what API returns) ----------- #
class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True  
