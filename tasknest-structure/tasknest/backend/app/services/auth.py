from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from typing import Optional
from datetime import datetime, timezone
from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate, Token, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token, decode_token
from app.services.activity import ActivityService
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.activity_service = ActivityService(db)

    async def register(self, user_data: UserCreate) -> User:
        """Register a new user"""
        existing = await self.db.execute(
            select(User).where(
                (User.username == user_data.username) | (User.email == user_data.email)
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Username or email already registered")

        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            is_active=True,
            theme_preference="light",
            mode_preference="professional",
        )
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            # Temporarily disable activity logging for debugging
            # await self.activity_service.log_activity(
            #     user_id=new_user.id,
            #     action="REGISTER",
            #     description=f"User {new_user.username} registered",
            #     commit=False,
            # )
            # await self.db.commit()
            return new_user
        except IntegrityError:
            await self.db.rollback()
            raise ValueError("Registration failed")

    async def login(self, username: str, password: str) -> Token:
        """Authenticate user and return JWT token"""
        result = await self.db.execute(
            select(User).where(
                (User.username == username) | (User.email == username)
            )
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("Account is deactivated")

        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username}
        )
        # Temporarily disable activity logging for debugging
        # await self.activity_service.log_activity(
        #     user_id=user.id,
        #     action="LOGIN",
        #     description=f"User {user.full_name or user.username} logged in",
        #     commit=False,
        # )
        # await self.db.commit()
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    async def logout(self, token: str) -> None:
        """Handle user logout"""
        payload = decode_token(token)
        if payload:
            user_id = payload.get("sub")
            if user_id:
                await self.activity_service.log_activity(
                    user_id=int(user_id),
                    action="LOGOUT",
                    description="User logged out",
                    commit=False,
                )
                await self.db.commit()

    async def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from JWT token"""
        payload = decode_token(token)
        if not payload:
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await self.db.execute(select(User).where(User.id == int(user_id)))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update_profile(self, user_id: int, data: UserUpdate) -> User:
        """Update user profile fields (full_name, email, username)"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if data.full_name is not None:
            user.full_name = data.full_name
        if data.email is not None:
            user.email = data.email
        if data.username is not None:
            user.username = data.username

        user.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)

        await self.activity_service.log_activity(
            user_id=user_id,
            action="UPDATE_PROFILE",
            description="Profile updated",
            commit=False,
        )
        await self.db.commit()
        return user

    async def change_password(
        self, user_id: int, current_password: str, new_password: str
    ) -> None:
        """Change the user's password after verifying the current one"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if not verify_password(current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")

        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.now(timezone.utc)
        await self.db.commit()

        await self.activity_service.log_activity(
            user_id=user_id,
            action="CHANGE_PASSWORD",
            description="Password changed",
            commit=False,
        )
        await self.db.commit()

    async def update_user_preferences(
        self, user_id: int, theme: Optional[str] = None, mode: Optional[str] = None
    ) -> User:
        """Update user theme / mode preferences"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if theme:
            user.theme_preference = theme
        if mode:
            user.mode_preference = mode
        user.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(user)
        await self.activity_service.log_activity(
            user_id=user_id,
            action="UPDATE_PREFERENCES",
            description="Preferences updated",
            commit=False,
        )
        await self.db.commit()
        return user
