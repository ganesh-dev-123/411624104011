from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.services.auth import AuthService
from app.schemas.auth import UserCreate, UserUpdate, ChangePassword, Token, UserResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── helpers ──────────────────────────────────────────────────────────────────

async def _require_user(token: str, db: AsyncSession):
    """Resolve token → user or raise 401."""
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user, auth_service


# ── public endpoints ──────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Registration attempt: {user_data.username}, {user_data.email}")
    auth_service = AuthService(db)
    try:
        user = await auth_service.register(user_data)
        logger.info(f"Registration successful: {user.username}")
        return user
    except ValueError as e:
        logger.error(f"Registration validation error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    try:
        token = await auth_service.login(form_data.username, form_data.password)
        return token
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


# ── protected endpoints ───────────────────────────────────────────────────────

@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    auth_service = AuthService(db)
    await auth_service.logout(token)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    user, _ = await _require_user(token, db)
    return user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Update profile fields: full_name, email, username."""
    user, auth_service = await _require_user(token, db)
    try:
        updated = await auth_service.update_profile(user.id, data)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    data: ChangePassword,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Change the authenticated user's password."""
    user, auth_service = await _require_user(token, db)
    try:
        await auth_service.change_password(user.id, data.current_password, data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
