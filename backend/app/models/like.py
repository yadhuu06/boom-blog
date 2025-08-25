from sqlalchemy import Column, Integer, ForeignKey
from app.db.database import Base

class Like(Base):
    __tablename__ = "likes"
    __table_args__ = {"schema": "boom_blog"}
    
    user_id = Column(Integer, ForeignKey("boom_blog.users.id"), primary_key=True) 
    post_id = Column(Integer, ForeignKey("boom_blog.posts.id"), primary_key=True)  
