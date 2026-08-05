#!/usr/bin/env python
"""
Alembic migration runner for TaskNest
"""

import subprocess
import sys
from pathlib import Path

def run_migrations():
    """Run Alembic migrations"""
    print("🔄 Running database migrations...")
    
    # Get the backend directory
    backend_dir = Path(__file__).parent
    
    # Run alembic upgrade
    result = subprocess.run(
        ["alembic", "upgrade", "head"],
        cwd=backend_dir,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Migrations completed successfully!")
        print(result.stdout)
    else:
        print("❌ Migrations failed!")
        print(result.stderr)
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()