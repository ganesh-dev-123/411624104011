from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database.connection import get_db
from app.services.category import CategoryService
from app.services.auth import AuthService
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.routers.auth import oauth2_scheme

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    category_service = CategoryService(db)
    categories = await category_service.get_categories(user.id)
    return categories

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    category_service = CategoryService(db)
    try:
        category = await category_service.create_category(category_data, user.id)
        return category
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    category_service = CategoryService(db)
    category = await category_service.update_category(category_id, category_data, user.id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService(db)
    user = await auth_service.get_current_user(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
    category_service = CategoryService(db)
    success = await category_service.delete_category(category_id, user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return None