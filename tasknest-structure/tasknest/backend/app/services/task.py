from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from app.models.task import Task, Priority, TaskStatus
from app.models.category import Category
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.activity import ActivityService
import logging

logger = logging.getLogger(__name__)

class TaskService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.activity_service = ActivityService(db)

    async def get_tasks(
        self,
        user_id: int,
        category_id: Optional[int] = None,
        priority: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        is_favorite: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """Get tasks with filters"""
        query = select(Task).where(Task.user_id == user_id)
        
        # Apply filters
        if category_id is not None:
            query = query.where(Task.category_id == category_id)
        
        if priority:
            query = query.where(Task.priority == priority)
        
        if status:
            query = query.where(Task.status == status)
        
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term)
                )
            )
        
        if start_date:
            query = query.where(Task.due_date >= datetime.fromisoformat(start_date))
        
        if end_date:
            query = query.where(Task.due_date <= datetime.fromisoformat(end_date))
        
        if is_favorite is not None:
            query = query.where(Task.is_favorite == is_favorite)
        
        # Order by position and creation date
        query = query.order_by(Task.order_position, desc(Task.created_at))
        query = query.offset(skip).limit(limit)
        
        # Eager load category
        query = query.options(selectinload(Task.category))
        
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """Get a single task by ID"""
        query = select(Task).where(
            and_(
                Task.id == task_id,
                Task.user_id == user_id
            )
        ).options(selectinload(Task.category))
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_task(self, task_data: TaskCreate, user_id: int) -> Task:
        """Create a new task"""
        # Get max order position
        result = await self.db.execute(
            select(func.max(Task.order_position)).where(Task.user_id == user_id)
        )
        max_position = result.scalar() or -1
        
        new_task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            category_id=task_data.category_id,
            priority=task_data.priority,
            status=task_data.status,
            due_date=task_data.due_date,
            due_time=task_data.due_time,
            color_label=task_data.color_label,
            emoji=task_data.emoji,
            reminder=task_data.reminder,
            estimated_time=task_data.estimated_time,
            notes=task_data.notes,
            is_favorite=task_data.is_favorite,
            is_archived=task_data.is_archived,
            completion_percentage=task_data.completion_percentage,
            order_position=max_position + 1
        )
        
        self.db.add(new_task)
        await self.db.commit()
        await self.db.refresh(new_task)
        
        # Log activity
        await self.activity_service.log_activity(
            user_id=user_id,
            action="CREATE_TASK",
            description=f"Created task: {new_task.title}"
        )
        
        return new_task

    async def update_task(self, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
        """Update a task"""
        task = await self.get_task(task_id, user_id)
        if not task:
            return None
        
        # Update fields
        update_data = task_data.model_dump(exclude_unset=True)
        
        # Handle status change
        old_status = task.status
        if 'status' in update_data and update_data['status'] != old_status:
            if update_data['status'] == TaskStatus.COMPLETED:
                task.completed_at = datetime.now(timezone.utc)
                task.completion_percentage = 100
            elif old_status == TaskStatus.COMPLETED:
                task.completed_at = None
        
        # Update completion percentage
        if 'completion_percentage' in update_data:
            if update_data['completion_percentage'] == 100 and task.status != TaskStatus.COMPLETED:
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now(timezone.utc)
            elif update_data['completion_percentage'] < 100 and task.status == TaskStatus.COMPLETED:
                task.status = TaskStatus.IN_PROGRESS
                task.completed_at = None
        
        # Apply updates
        for key, value in update_data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        
        task.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(task)
        
        # Log activity
        await self.activity_service.log_activity(
            user_id=user_id,
            action="UPDATE_TASK",
            description=f"Updated task: {task.title}"
        )
        
        return task

    async def delete_task(self, task_id: int, user_id: int) -> bool:
        """Delete a task"""
        task = await self.get_task(task_id, user_id)
        if not task:
            return False
        
        # Store title for logging
        task_title = task.title
        
        await self.db.delete(task)
        await self.db.commit()
        
        # Log activity
        await self.activity_service.log_activity(
            user_id=user_id,
            action="DELETE_TASK",
            description=f"Deleted task: {task_title}"
        )
        
        return True

    async def reorder_tasks(self, task_ids: List[int], user_id: int) -> None:
        """Reorder tasks"""
        for index, task_id in enumerate(task_ids):
            task = await self.get_task(task_id, user_id)
            if task:
                task.order_position = index
                task.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()

    async def duplicate_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """Duplicate a task"""
        original_task = await self.get_task(task_id, user_id)
        if not original_task:
            return None
        
        # Create new task from original
        new_task = Task(
            user_id=user_id,
            title=f"{original_task.title} (Copy)",
            description=original_task.description,
            category_id=original_task.category_id,
            priority=original_task.priority,
            status=TaskStatus.PENDING,  # Always start as pending
            due_date=original_task.due_date,
            due_time=original_task.due_time,
            color_label=original_task.color_label,
            emoji=original_task.emoji,
            reminder=original_task.reminder,
            estimated_time=original_task.estimated_time,
            notes=original_task.notes,
            is_favorite=False,
            is_archived=False,
            completion_percentage=0,
            order_position=original_task.order_position + 1
        )
        
        self.db.add(new_task)
        await self.db.commit()
        await self.db.refresh(new_task)
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="DUPLICATE_TASK",
            description=f"Duplicated task: {original_task.title}"
        )
        
        return new_task

    async def archive_task(self, task_id: int, user_id: int) -> Optional[Task]:
        """Archive a task"""
        task = await self.get_task(task_id, user_id)
        if not task:
            return None
        
        task.is_archived = True
        task.status = TaskStatus.ARCHIVED
        task.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        await self.db.refresh(task)
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="ARCHIVE_TASK",
            description=f"Archived task: {task.title}"
        )
        
        return task

    async def get_task_statistics(self, user_id: int) -> Dict[str, Any]:
        """Get task statistics for a user"""
        tasks = await self.get_tasks(user_id, limit=1000)
        
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
        pending = sum(1 for t in tasks if t.status == TaskStatus.PENDING)
        in_progress = sum(1 for t in tasks if t.status == TaskStatus.IN_PROGRESS)
        overdue = sum(1 for t in tasks if t.due_date and t.due_date < datetime.now(timezone.utc) 
                     and t.status != TaskStatus.COMPLETED)
        
        # Calculate average completion time for completed tasks
        completion_times = []
        for task in tasks:
            if task.status == TaskStatus.COMPLETED and task.completed_at and task.created_at:
                time_diff = (task.completed_at - task.created_at).total_seconds() / 3600
                completion_times.append(time_diff)
        
        avg_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
        
        # Calculate streaks
        current_streak = 0
        longest_streak = 0
        streak = 0
        
        # Get tasks completed by date
        completed_dates = set()
        for task in tasks:
            if task.status == TaskStatus.COMPLETED and task.completed_at:
                date_str = task.completed_at.date().isoformat()
                completed_dates.add(date_str)
        
        # Calculate streaks
        sorted_dates = sorted(completed_dates)
        for i, date_str in enumerate(sorted_dates):
            if i == 0:
                streak = 1
            else:
                prev_date = datetime.fromisoformat(sorted_dates[i-1]).date()
                curr_date = datetime.fromisoformat(date_str).date()
                if (curr_date - prev_date).days == 1:
                    streak += 1
                else:
                    streak = 1
            longest_streak = max(longest_streak, streak)
        
        # Check current streak
        today = datetime.now(timezone.utc).date()
        if today.isoformat() in completed_dates:
            current_streak = 1
            check_date = today - timedelta(days=1)
            while check_date.isoformat() in completed_dates:
                current_streak += 1
                check_date -= timedelta(days=1)
        
        # Most productive day
        from collections import Counter
        day_counts = Counter()
        for task in tasks:
            if task.status == TaskStatus.COMPLETED and task.completed_at:
                day_name = task.completed_at.strftime('%A')
                day_counts[day_name] += 1
        
        most_productive_day = day_counts.most_common(1)[0][0] if day_counts else "N/A"
        
        # Productivity score (0-100)
        if total > 0:
            completion_rate = completed / total
            on_time_rate = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED 
                              and t.due_date and t.completed_at <= t.due_date) / max(completed, 1)
            productivity_score = min(100, int((completion_rate * 0.7 + on_time_rate * 0.3) * 100))
        else:
            productivity_score = 0
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
            "overdue": overdue,
            "completion_percentage": int((completed / total * 100)) if total > 0 else 0,
            "avg_completion_time": round(avg_completion_time, 2),
            "longest_streak": longest_streak,
            "current_streak": current_streak,
            "most_productive_day": most_productive_day,
            "productivity_score": productivity_score
        }
