from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from datetime import timedelta
from typing import Optional
from app.models.user import User
from app.schemas.auth import UserCreate, Token, UserResponse
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
        # Check if username or email already exists
        existing_user = await self.db.execute(
            select(User).where(
                (User.username == user_data.username) | 
                (User.email == user_data.email)
            )
        )
        if existing_user.scalar_one_or_none():
            raise ValueError("Username or email already registered")

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_active=True,
            theme_preference="light",
            mode_preference="professional"
        )
        
        self.db.add(new_user)
        try:
            await self.db.commit()
            await self.db.refresh(new_user)
            
            # Log activity
            await self.activity_service.log_activity(
                user_id=new_user.id,
                action="REGISTER",
                description=f"User {new_user.username} registered"
            )
            
            return new_user
        except IntegrityError:
            await self.db.rollback()
            raise ValueError("Registration failed")

    async def login(self, username: str, password: str) -> Token:
        """Authenticate user and return JWT token"""
        # Find user by username or email
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

        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username}
        )

        # Log activity
        await self.activity_service.log_activity(
            user_id=user.id,
            action="LOGIN",
            description=f"User {user.username} logged in"
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
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
                    description=f"User logged out"
                )

    async def get_current_user(self, token: str) -> Optional[User]:
        """Get current user from JWT token"""
        payload = decode_token(token)
        if not payload:
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        result = await self.db.execute(
            select(User).where(User.id == int(user_id))
        )
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def update_user_preferences(self, user_id: int, theme: Optional[str] = None, 
                                     mode: Optional[str] = None) -> User:
        """Update user preferences"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        if theme:
            user.theme_preference = theme
        if mode:
            user.mode_preference = mode

        await self.db.commit()
        await self.db.refresh(user)
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="UPDATE_PREFERENCES",
            description=f"User updated preferences"
        )
        
        return user