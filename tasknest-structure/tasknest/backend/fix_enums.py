"""
Run this script ONCE to update the enum column values in MySQL
from Title Case to UPPERCASE to match the frontend.

Usage:  python fix_enums.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@localhost:3306/tasknest_db"
).replace("mysql+pymysql", "mysql+aiomysql")


async def fix_enums():
    engine = create_async_engine(DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        print("Updating priority and status enum columns...")

        # Step 1 – widen the columns to VARCHAR so any value is accepted temporarily
        await conn.execute(text(
            "ALTER TABLE tasks MODIFY COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'"
        ))
        await conn.execute(text(
            "ALTER TABLE tasks MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING'"
        ))

        # Step 2 – update existing data to UPPERCASE
        priority_map = {
            "Low": "LOW",
            "Medium": "MEDIUM",
            "High": "HIGH",
            "Critical": "CRITICAL",
        }
        status_map = {
            "Pending": "PENDING",
            "In Progress": "IN_PROGRESS",
            "Completed": "COMPLETED",
            "Cancelled": "CANCELLED",
            "Archived": "ARCHIVED",
        }

        for old, new in priority_map.items():
            await conn.execute(
                text("UPDATE tasks SET priority = :new WHERE priority = :old"),
                {"new": new, "old": old}
            )
            print(f"  priority: '{old}' -> '{new}'")

        for old, new in status_map.items():
            await conn.execute(
                text("UPDATE tasks SET status = :new WHERE status = :old"),
                {"new": new, "old": old}
            )
            print(f"  status: '{old}' -> '{new}'")

        # Step 3 – restore proper ENUM constraints with new values
        await conn.execute(text(
            "ALTER TABLE tasks MODIFY COLUMN priority "
            "ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM'"
        ))
        await conn.execute(text(
            "ALTER TABLE tasks MODIFY COLUMN status "
            "ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED','ARCHIVED') "
            "NOT NULL DEFAULT 'PENDING'"
        ))

        print("\nDone! Enum columns updated successfully.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(fix_enums())
