from sqlalchemy import Column, Integer, ForeignKey
from app.db.database import Base

class View(Base):
    __tablename__ = "views"
    __table_args__ = {"schema": "boom_blog"}
    
    user_id = Column(Integer, ForeignKey("boom_blog.users.id"), primary_key=True) 
    post_id = Column(Integer, ForeignKey("boom_blog.posts.id"), primary_key=True)  
