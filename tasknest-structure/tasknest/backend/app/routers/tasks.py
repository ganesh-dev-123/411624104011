from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database.connection import get_db
from app.services.task import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder
from app.routers.auth import oauth2_scheme
from app.services.auth import AuthService
from app.services.activity import ActivityService
from app.schemas.activity import ActivityResponse

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
    category_id: Optional[int] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    tasks = await task_service.get_tasks(
        user.id,
        category_id=category_id,
        priority=priority,
        status=status,
        search=search,
        start_date=start_date,
        end_date=end_date,
        is_favorite=is_favorite,
        skip=skip,
        limit=limit
    )
    return tasks

@router.get("/activities", response_model=List[ActivityResponse])
async def get_recent_activities(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    activity_service = ActivityService(db)
    activities = await activity_service.get_recent_activities(user.id, limit)
    return activities

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    task = await task_service.get_task(task_id, user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return task

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    task = await task_service.create_task(task_data, user.id)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    task = await task_service.update_task(task_id, task_data, user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    success = await task_service.delete_task(task_id, user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None

@router.post("/reorder")
async def reorder_tasks(
    reorder_data: TaskReorder,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    await task_service.reorder_tasks(reorder_data.task_ids, user.id)
    return {"message": "Tasks reordered successfully"}

@router.post("/{task_id}/duplicate", response_model=TaskResponse)
async def duplicate_task(
    task_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    task = await task_service.duplicate_task(task_id, user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return task

@router.post("/{task_id}/archive")
async def archive_task(
    task_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    task_service = TaskService(db)
    task = await task_service.archive_task(task_id, user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"message": "Task archived successfully"}