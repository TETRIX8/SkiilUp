#!/usr/bin/env python3
"""
Скрипт для миграции базы данных и добавления таблиц достижений
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models import db
from src.models.achievement import Achievement, UserStats
from src.models.user import User

def migrate_achievements():
    """Миграция для добавления таблиц достижений"""
    with app.app_context():
        print("🔄 Начинаем миграцию достижений...")
        
        # Создаем таблицы
        print("📋 Создаем таблицы достижений...")
        db.create_all()
        
        # Проверяем существующих пользователей и создаем для них статистику
        print("👥 Создаем статистику для существующих пользователей...")
        users = User.query.all()
        
        for user in users:
            # Создаем статистику пользователя
            existing_stats = UserStats.query.filter_by(user_id=user.id).first()
            if not existing_stats:
                stats = UserStats(user_id=user.id)
                db.session.add(stats)
                print(f"✅ Создана статистика для пользователя {user.email}")
            
            # Создаем базовые достижения для пользователя
            from src.services.achievement_service import AchievementService
            
            for achievement_type in AchievementService.ACHIEVEMENTS.keys():
                existing_achievement = Achievement.query.filter_by(
                    user_id=user.id,
                    achievement_type=achievement_type
                ).first()
                
                if not existing_achievement:
                    achievement = Achievement(
                        user_id=user.id,
                        achievement_type=achievement_type,
                        current_progress=0,
                        is_completed=False
                    )
                    db.session.add(achievement)
                    print(f"✅ Создано достижение {achievement_type} для пользователя {user.email}")
        
        # Сохраняем изменения
        try:
            db.session.commit()
            print("✅ Миграция успешно завершена!")
            print(f"📊 Создано записей статистики: {UserStats.query.count()}")
            print(f"🏆 Создано записей достижений: {Achievement.query.count()}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Ошибка при миграции: {e}")
            return False
        
        return True

if __name__ == "__main__":
    success = migrate_achievements()
    if success:
        print("\n🎉 Миграция достижений завершена успешно!")
        print("Теперь система достижений готова к работе.")
    else:
        print("\n💥 Миграция достижений завершилась с ошибками.")
        sys.exit(1) 