from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.activity import ActivityService

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.activity_service = ActivityService(db)

    DEFAULT_CATEGORIES = [
        {"name": "Personal", "icon": "👤", "color": "#4F46E5"},
        {"name": "Work", "icon": "💼", "color": "#7C3AED"},
        {"name": "School", "icon": "📚", "color": "#10B981"},
        {"name": "Shopping", "icon": "🛒", "color": "#F59E0B"},
        {"name": "Health", "icon": "💪", "color": "#EF4444"},
        {"name": "Fitness", "icon": "🏋️", "color": "#3B82F6"},
        {"name": "Study", "icon": "📖", "color": "#8B5CF6"},
        {"name": "Coding", "icon": "💻", "color": "#06B6D4"},
        {"name": "Travel", "icon": "✈️", "color": "#F97316"},
        {"name": "Kids", "icon": "🧒", "color": "#EC4899"},
        {"name": "Others", "icon": "📌", "color": "#6B7280"}
    ]

    async def initialize_default_categories(self, user_id: int) -> None:
        """Initialize default categories for a new user"""
        for category_data in self.DEFAULT_CATEGORIES:
            existing = await self.get_category_by_name(user_id, category_data["name"])
            if not existing:
                category = Category(
                    user_id=user_id,
                    name=category_data["name"],
                    icon=category_data["icon"],
                    color=category_data["color"],
                    is_custom=False,
                    is_active=True
                )
                self.db.add(category)
        await self.db.commit()

    async def get_categories(self, user_id: int) -> List[Category]:
        """Get all categories for a user"""
        result = await self.db.execute(
            select(Category).where(
                and_(
                    Category.user_id == user_id,
                    Category.is_active == True
                )
            ).order_by(Category.name)
        )
        return result.scalars().all()

    async def get_category(self, category_id: int, user_id: int) -> Optional[Category]:
        """Get a single category by ID"""
        result = await self.db.execute(
            select(Category).where(
                and_(
                    Category.id == category_id,
                    Category.user_id == user_id
                )
            )
        )
        return result.scalar_one_or_none()

    async def get_category_by_name(self, user_id: int, name: str) -> Optional[Category]:
        """Get category by name"""
        result = await self.db.execute(
            select(Category).where(
                and_(
                    Category.user_id == user_id,
                    Category.name == name
                )
            )
        )
        return result.scalar_one_or_none()

    async def create_category(self, category_data: CategoryCreate, user_id: int) -> Category:
        """Create a new category"""
        # Check if category already exists
        existing = await self.get_category_by_name(user_id, category_data.name)
        if existing:
            raise ValueError("Category already exists")
        
        new_category = Category(
            user_id=user_id,
            name=category_data.name,
            icon=category_data.icon or "📌",
            color=category_data.color or "#6B7280",
            is_custom=True,
            is_active=True
        )
        
        self.db.add(new_category)
        await self.db.commit()
        await self.db.refresh(new_category)
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="CREATE_CATEGORY",
            description=f"Created category: {new_category.name}"
        )
        
        return new_category

    async def update_category(self, category_id: int, category_data: CategoryUpdate, 
                             user_id: int) -> Optional[Category]:
        """Update a category"""
        category = await self.get_category(category_id, user_id)
        if not category:
            return None
        
        if category_data.name:
            category.name = category_data.name
        if category_data.icon:
            category.icon = category_data.icon
        if category_data.color:
            category.color = category_data.color
        
        await self.db.commit()
        await self.db.refresh(category)
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="UPDATE_CATEGORY",
            description=f"Updated category: {category.name}"
        )
        
        return category

    async def delete_category(self, category_id: int, user_id: int) -> bool:
        """Delete a category (soft delete)"""
        category = await self.get_category(category_id, user_id)
        if not category:
            return False
        
        category.is_active = False
        await self.db.commit()
        
        await self.activity_service.log_activity(
            user_id=user_id,
            action="DELETE_CATEGORY",
            description=f"Deleted category: {category.name}"
        )
        
        return True