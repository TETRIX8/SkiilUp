#!/usr/bin/env python3
"""
Database migration script to add file_name column to submission table
"""
import os
import sys
import sqlite3

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def migrate_database():
    """Add file_name column to submission table if it doesn't exist"""
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if file_name column exists
        cursor.execute("PRAGMA table_info(submission)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'file_name' not in columns:
            print("Adding file_name column to submission table...")
            cursor.execute("ALTER TABLE submission ADD COLUMN file_name VARCHAR(255)")
            conn.commit()
            print("✅ Migration completed successfully!")
        else:
            print("✅ file_name column already exists")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        return False

if __name__ == '__main__':
    migrate_database()

