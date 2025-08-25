from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Comment(Base):
    __tablename__ = "comments"
    __table_args__ = {"schema": "boom_blog"}

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_approved = Column(Boolean, default=False)

    post_id = Column(Integer, ForeignKey("boom_blog.posts.id"))  
    user_id = Column(Integer, ForeignKey("boom_blog.users.id"))  

    post = relationship("Post", back_populates="comments")
    user = relationship("User")
