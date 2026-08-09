from pydantic import BaseModel, EmailStr, Field, field_serializer, field_validator
from typing import Optional
from datetime import datetime, timezone
import re


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str  # Changed from EmailStr to str for compatibility
    full_name: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        # Simple email validation only
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', v):
            raise ValueError("Invalid email format")
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    """Payload for PUT /api/auth/me"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)


class ChangePassword(BaseModel):
    """Payload for POST /api/auth/change-password"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    is_active: bool
    theme_preference: str
    mode_preference: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_serializer("created_at")
    def _serialize_created_at(self, v: datetime) -> str:
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v.isoformat()

    @field_serializer("updated_at")
    def _serialize_updated_at(self, v: Optional[datetime]) -> Optional[str]:
        if v is None:
            return None
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v.isoformat()


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
