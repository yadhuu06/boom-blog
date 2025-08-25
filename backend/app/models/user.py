from sqlalchemy import Column, Integer, String, Boolean
from app.db.database import Base
from sqlalchemy.orm import relationship
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "boom_blog"}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    posts = relationship("Post", back_populates="author")
