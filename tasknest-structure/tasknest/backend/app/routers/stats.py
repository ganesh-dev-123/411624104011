from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.database.connection import get_db
from app.services.task import TaskService
from app.services.auth import AuthService
from app.routers.auth import oauth2_scheme

router = APIRouter()

@router.get("/")
async def get_statistics(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    stats = await task_service.get_task_statistics(user.id)
    return stats