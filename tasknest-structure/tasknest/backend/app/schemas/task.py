from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime, timezone
from app.models.task import Priority, TaskStatus


def _utc(dt: Optional[datetime]) -> Optional[str]:
    """Attach UTC info to a naive datetime and return ISO string."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category_id: Optional[int] = None
    priority: Priority = Priority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    due_time: Optional[str] = None
    color_label: Optional[str] = None
    emoji: Optional[str] = None
    reminder: Optional[datetime] = None
    estimated_time: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    is_favorite: bool = False
    is_archived: bool = False
    completion_percentage: int = Field(0, ge=0, le=100)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[TaskStatus] = None
    completion_percentage: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    order_position: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    category_name: Optional[str] = None
    category_color: Optional[str] = None

    model_config = {"from_attributes": True}

    @field_serializer("created_at")
    def serialize_created_at(self, v: datetime) -> str:
        return _utc(v)

    @field_serializer("updated_at")
    def serialize_updated_at(self, v: Optional[datetime]) -> Optional[str]:
        return _utc(v)

    @field_serializer("completed_at")
    def serialize_completed_at(self, v: Optional[datetime]) -> Optional[str]:
        return _utc(v)


class TaskReorder(BaseModel):
    task_ids: list[int]
