from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    extra_data = Column(Text, nullable=True)  # Changed from 'metadata' to 'extra_data'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", backref="activities")