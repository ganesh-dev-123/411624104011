from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime, timezone
from app.models.activity import ActivityLog


class ActivityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_activity(
        self,
        user_id: int,
        action: str,
        description: str,
        extra_data: Optional[str] = None,
    ) -> None:
        activity = ActivityLog(
            user_id=user_id,
            action=action,
            description=description,
            extra_data=extra_data,
            # Always store UTC with explicit timezone so MySQL TIMESTAMP columns
            # carry the correct value regardless of server locale.
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(activity)
        await self.db.commit()

    async def get_recent_activities(
        self, user_id: int, limit: int = 20
    ) -> List[ActivityLog]:
        result = await self.db.execute(
            select(ActivityLog)
            .where(ActivityLog.user_id == user_id)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
        )
        return result.scalars().all()
