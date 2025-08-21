#!/usr/bin/env python3
"""
Скрипт для добавления поля is_viewed в таблицу achievements
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app
from src.models import db
from sqlalchemy import text

def add_is_viewed_column():
    """Добавляет поле is_viewed в таблицу achievements"""
    with app.app_context():
        try:
            # Для SQLite просто пытаемся добавить колонку
            # Если она уже существует, получим ошибку, которую игнорируем
            try:
                db.session.execute(text("""
                    ALTER TABLE achievement 
                    ADD COLUMN is_viewed BOOLEAN DEFAULT FALSE
                """))
                db.session.commit()
                print("Поле is_viewed успешно добавлено в таблицу achievement")
            except Exception as e:
                if "duplicate column name" in str(e) or "already exists" in str(e):
                    print("Поле is_viewed уже существует в таблице achievement")
                    db.session.rollback()
                else:
                    raise e
            
        except Exception as e:
            db.session.rollback()
            print(f"Ошибка при добавлении поля is_viewed: {e}")
            raise

def update_existing_achievements():
    """Обновляет существующие достижения, устанавливая is_viewed = True для завершенных"""
    with app.app_context():
        try:
            # Устанавливаем is_viewed = True для всех завершенных достижений
            db.session.execute(text("""
                UPDATE achievement 
                SET is_viewed = TRUE 
                WHERE is_completed = TRUE
            """))
            
            db.session.commit()
            print("Существующие завершенные достижения отмечены как просмотренные")
            
        except Exception as e:
            db.session.rollback()
            print(f"Ошибка при обновлении существующих достижений: {e}")
            raise

if __name__ == "__main__":
    print("Начинаем миграцию базы данных...")
    
    try:
        add_is_viewed_column()
        update_existing_achievements()
        print("Миграция завершена успешно!")
        
    except Exception as e:
        print(f"Ошибка миграции: {e}")
        sys.exit(1) 