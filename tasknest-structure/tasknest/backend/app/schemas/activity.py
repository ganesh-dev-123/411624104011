from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, timezone


class ActivityResponse(BaseModel):
    id: int
    user_id: int
    action: str
    description: Optional[str] = None
    extra_data: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        """Always return an ISO-8601 string with explicit UTC offset (+00:00).
        
        MySQL returns naive datetimes (no tzinfo). We treat every stored value
        as UTC and attach the offset so the browser never interprets the stamp
        as local time.
        """
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
