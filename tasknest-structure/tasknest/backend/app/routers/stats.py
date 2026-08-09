from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from app.database.connection import get_db
from app.services.task import TaskService
from app.services.auth import AuthService
from app.routers.auth import oauth2_scheme
from app.models.task import Task, TaskStatus

router = APIRouter()


@router.get("/")
async def get_statistics(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    task_service = TaskService(db)
    stats = await task_service.get_task_statistics(user.id)
    return stats


@router.get("/weekly")
async def get_weekly_stats(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> List[Dict[str, Any]]:
    """
    Returns per-day task creation counts for the last 7 days (user's local calendar
    days, compared in UTC).  The frontend receives an array of 7 objects:
      [{ date: "2026-08-05", label: "Wed", created: 3, completed: 0 }, ...]
    """
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    now_utc = datetime.now(timezone.utc)

    # Build day buckets for last 7 days (today = index 0)
    days: List[Dict[str, Any]] = []
    for offset in range(6, -1, -1):          # 6 days ago … today
        day_utc = now_utc - timedelta(days=offset)
        day_start = day_utc.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = day_start + timedelta(days=1)

        # Count tasks CREATED that day
        created_result = await db.execute(
            select(func.count(Task.id)).where(
                and_(
                    Task.user_id == user.id,
                    Task.created_at >= day_start,
                    Task.created_at < day_end,
                )
            )
        )
        created_count = created_result.scalar() or 0

        # Count tasks COMPLETED that day
        completed_result = await db.execute(
            select(func.count(Task.id)).where(
                and_(
                    Task.user_id == user.id,
                    Task.status == TaskStatus.COMPLETED,
                    Task.completed_at >= day_start,
                    Task.completed_at < day_end,
                )
            )
        )
        completed_count = completed_result.scalar() or 0

        days.append({
            "date":      day_start.strftime("%Y-%m-%d"),
            "label":     day_start.strftime("%a"),   # Mon, Tue … Sun
            "created":   created_count,
            "completed": completed_count,
        })

    return days
