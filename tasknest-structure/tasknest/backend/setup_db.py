#!/usr/bin/env python
"""
Database setup script for TaskNest
Run this script to initialize the database
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to sys.path
sys.path.append(str(Path(__file__).parent))

from app.database.connection import engine, Base
from app.models.user import User
from app.models.task import Task
from app.models.category import Category
from app.models.activity import ActivityLog

async def setup_database():
    """Setup database tables"""
    print("🔄 Setting up TaskNest database...")
    
    async with engine.begin() as conn:
        # Drop all tables (if they exist)
        print("🗑️  Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        print("📦 Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database setup complete!")
    print("📋 Tables created:")
    print("   - users")
    print("   - tasks")
    print("   - categories")
    print("   - activity_logs")

if __name__ == "__main__":
    asyncio.run(setup_database())



