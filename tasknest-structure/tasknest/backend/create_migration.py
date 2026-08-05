#!/usr/bin/env python
"""
Create initial Alembic migration for TaskNest
"""

import subprocess
import sys
from pathlib import Path

def create_migration():
    """Create initial migration"""
    print("🔄 Creating initial migration...")
    
    backend_dir = Path(__file__).parent
    
    # Create migration
    result = subprocess.run(
        ["alembic", "revision", "--autogenerate", "-m", "Initial migration"],
        cwd=backend_dir,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Migration created successfully!")
        print(result.stdout)
    else:
        print("❌ Migration creation failed!")
        print(result.stderr)
        sys.exit(1)

if __name__ == "__main__":
    create_migration()