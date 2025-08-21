from src.models.achievement import Achievement, UserStats
from src.models.user import User
from src.models.submission import Submission
from src.models.assignment import Assignment
from src.models.topic import Topic
from src.models import db
from datetime import datetime, date, timedelta
from sqlalchemy import and_

class AchievementService:
    # Определение всех возможных достижений
    ACHIEVEMENTS = {
        'daily_streak_3': {
            'title': 'Первые шаги',
            'description': 'Посещайте сайт 3 дня подряд',
            'max_progress': 3,
            'reward_xp': 50,
            'reward_badge': 'bronze',
            'category': 'Посещения'
        },
        'daily_streak_7': {
            'title': 'Недельный марафон',
            'description': 'Посещайте сайт 7 дней подряд',
            'max_progress': 7,
            'reward_xp': 150,
            'reward_badge': 'silver',
            'category': 'Посещения'
        },
        'daily_streak_30': {
            'title': 'Месяц упорства',
            'description': 'Посещайте сайт 30 дней подряд',
            'max_progress': 30,
            'reward_xp': 500,
            'reward_badge': 'gold',
            'category': 'Посещения'
        },
        'assignments_completed_3': {
            'title': 'Первые успехи',
            'description': 'Выполните 3 задания',
            'max_progress': 3,
            'reward_xp': 100,
            'reward_badge': 'bronze',
            'category': 'Задания'
        },
        'assignments_completed_10': {
            'title': 'Десятиборье',
            'description': 'Выполните 10 заданий',
            'max_progress': 10,
            'reward_xp': 300,
            'reward_badge': 'silver',
            'category': 'Задания'
        },
        'assignments_completed_25': {
            'title': 'Мастер заданий',
            'description': 'Выполните 25 заданий',
            'max_progress': 25,
            'reward_xp': 750,
            'reward_badge': 'gold',
            'category': 'Задания'
        },
        'perfect_score_5': {
            'title': 'Отличник',
            'description': 'Получите 5 отличных оценок',
            'max_progress': 5,
            'reward_xp': 200,
            'reward_badge': 'silver',
            'category': 'Оценки'
        },
        'perfect_score_15': {
            'title': 'Супер отличник',
            'description': 'Получите 15 отличных оценок',
            'max_progress': 15,
            'reward_xp': 600,
            'reward_badge': 'gold',
            'category': 'Оценки'
        },
        'topics_completed_5': {
            'title': 'Любознательный',
            'description': 'Изучите 5 тем',
            'max_progress': 5,
            'reward_xp': 150,
            'reward_badge': 'bronze',
            'category': 'Изучение'
        },
        'topics_completed_15': {
            'title': 'Эрудит',
            'description': 'Изучите 15 тем',
            'max_progress': 15,
            'reward_xp': 400,
            'reward_badge': 'silver',
            'category': 'Изучение'
        },
        'fast_learner': {
            'title': 'Быстрый ученик',
            'description': 'Выполните 3 задания за один день',
            'max_progress': 3,
            'reward_xp': 250,
            'reward_badge': 'silver',
            'category': 'Скорость'
        },
        'consistent_learner': {
            'title': 'Последовательный ученик',
            'description': 'Выполняйте задания 5 дней подряд',
            'max_progress': 5,
            'reward_xp': 300,
            'reward_badge': 'silver',
            'category': 'Последовательность'
        },
        'first_perfect': {
            'title': 'Первый успех',
            'description': 'Получите первую отличную оценку',
            'max_progress': 1,
            'reward_xp': 100,
            'reward_badge': 'bronze',
            'category': 'Специальные'
        },
        'early_bird': {
            'title': 'Ранняя пташка',
            'description': 'Выполните задание до дедлайна',
            'max_progress': 1,
            'reward_xp': 75,
            'reward_badge': 'bronze',
            'category': 'Специальные'
        },
        'helpful_student': {
            'title': 'Помощник',
            'description': 'Помогите другим студентам (комментарии)',
            'max_progress': 5,
            'reward_xp': 200,
            'reward_badge': 'silver',
            'category': 'Социальные'
        }
    }

    @staticmethod
    def get_or_create_user_stats(user_id):
        """Получить или создать статистику пользователя"""
        stats = UserStats.query.filter_by(user_id=user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id)
            db.session.add(stats)
            db.session.commit()
        return stats

    @staticmethod
    def get_or_create_achievement(user_id, achievement_type):
        """Получить или создать достижение для пользователя"""
        achievement = Achievement.query.filter_by(
            user_id=user_id, 
            achievement_type=achievement_type
        ).first()
        
        if not achievement:
            achievement = Achievement(
                user_id=user_id,
                achievement_type=achievement_type,
                current_progress=0,
                is_completed=False
            )
            db.session.add(achievement)
            db.session.commit()
        
        return achievement

    @staticmethod
    def update_achievement_progress(user_id, achievement_type, new_progress):
        """Обновить прогресс достижения"""
        achievement = AchievementService.get_or_create_achievement(user_id, achievement_type)
        achievement_config = AchievementService.ACHIEVEMENTS.get(achievement_type)
        
        if not achievement_config:
            return None
        
        old_progress = achievement.current_progress
        achievement.current_progress = min(new_progress, achievement_config['max_progress'])
        
        # Проверяем, завершено ли достижение
        if (not achievement.is_completed and 
            achievement.current_progress >= achievement_config['max_progress']):
            achievement.is_completed = True
            achievement.completed_at = datetime.utcnow()
            
            # Добавляем XP пользователю
            stats = AchievementService.get_or_create_user_stats(user_id)
            stats.total_xp += achievement_config['reward_xp']
            
            # Обновляем уровень
            AchievementService.update_user_level(stats)
        
        db.session.commit()
        return achievement

    @staticmethod
    def update_user_level(stats):
        """Обновить уровень пользователя на основе XP"""
        # Простая формула: каждый уровень требует level * 100 XP
        new_level = 1
        xp_needed = 0
        
        for level in range(1, 100):  # Максимум 100 уровней
            level_xp = level * 100
            if stats.total_xp >= xp_needed + level_xp:
                new_level = level + 1
                xp_needed += level_xp
            else:
                break
        
        if new_level != stats.level:
            stats.level = new_level
        
        # Вычисляем прогресс текущего уровня
        current_level_xp = (stats.level - 1) * 100
        next_level_xp = stats.level * 100
        level_progress = ((stats.total_xp - current_level_xp) / (next_level_xp - current_level_xp)) * 100
        stats.level_progress = min(100, max(0, int(level_progress)))

    @staticmethod
    def record_daily_visit(user_id):
        """Записать ежедневное посещение"""
        stats = AchievementService.get_or_create_user_stats(user_id)
        today = date.today()
        
        if stats.last_visit_date != today:
            if stats.last_visit_date and (today - stats.last_visit_date).days == 1:
                # Последовательное посещение
                stats.daily_streak += 1
            elif stats.last_visit_date and (today - stats.last_visit_date).days > 1:
                # Пропустил день, сбрасываем счетчик
                stats.daily_streak = 1
            else:
                # Первое посещение
                stats.daily_streak = 1
            
            stats.last_visit_date = today
            db.session.commit()
            
            # Обновляем достижения за посещения
            AchievementService.update_achievement_progress(
                user_id, 'daily_streak_3', stats.daily_streak
            )
            AchievementService.update_achievement_progress(
                user_id, 'daily_streak_7', stats.daily_streak
            )
            AchievementService.update_achievement_progress(
                user_id, 'daily_streak_30', stats.daily_streak
            )

    @staticmethod
    def record_assignment_submission(user_id, assignment_id, submitted_at=None):
        """Записать отправку задания"""
        if not submitted_at:
            submitted_at = datetime.utcnow()
        
        stats = AchievementService.get_or_create_user_stats(user_id)
        today = date.today()
        
        # Обновляем счетчик выполненных заданий
        stats.assignments_completed += 1
        
        # Обновляем задания за сегодня
        if stats.last_assignment_date == today:
            stats.assignments_today += 1
        else:
            stats.assignments_today = 1
            stats.last_assignment_date = today
        
        # Обновляем последовательные дни
        if stats.last_assignment_date and (today - stats.last_assignment_date).days == 1:
            stats.consistent_days += 1
        elif stats.last_assignment_date and (today - stats.last_assignment_date).days > 1:
            stats.consistent_days = 1
        else:
            stats.consistent_days = 1
        
        db.session.commit()
        
        # Обновляем достижения за задания
        AchievementService.update_achievement_progress(
            user_id, 'assignments_completed_3', stats.assignments_completed
        )
        AchievementService.update_achievement_progress(
            user_id, 'assignments_completed_10', stats.assignments_completed
        )
        AchievementService.update_achievement_progress(
            user_id, 'assignments_completed_25', stats.assignments_completed
        )
        
        # Достижение за быстрые задания
        AchievementService.update_achievement_progress(
            user_id, 'fast_learner', stats.assignments_today
        )
        
        # Достижение за последовательность
        AchievementService.update_achievement_progress(
            user_id, 'consistent_learner', stats.consistent_days
        )
        
        # Проверяем раннюю отправку
        assignment = Assignment.query.get(assignment_id)
        if assignment and assignment.due_date:
            if submitted_at < assignment.due_date:
                stats.early_submissions += 1
                db.session.commit()
                AchievementService.update_achievement_progress(
                    user_id, 'early_bird', stats.early_submissions
                )

    @staticmethod
    def record_perfect_score(user_id):
        """Записать отличную оценку"""
        stats = AchievementService.get_or_create_user_stats(user_id)
        stats.perfect_scores += 1
        
        # Первая отличная оценка
        if not stats.first_perfect:
            stats.first_perfect = True
            AchievementService.update_achievement_progress(
                user_id, 'first_perfect', 1
            )
        
        db.session.commit()
        
        # Обновляем достижения за отличные оценки
        AchievementService.update_achievement_progress(
            user_id, 'perfect_score_5', stats.perfect_scores
        )
        AchievementService.update_achievement_progress(
            user_id, 'perfect_score_15', stats.perfect_scores
        )

    @staticmethod
    def record_topic_completion(user_id, topic_id):
        """Записать завершение темы"""
        stats = AchievementService.get_or_create_user_stats(user_id)
        stats.topics_completed += 1
        db.session.commit()
        
        # Обновляем достижения за темы
        AchievementService.update_achievement_progress(
            user_id, 'topics_completed_5', stats.topics_completed
        )
        AchievementService.update_achievement_progress(
            user_id, 'topics_completed_15', stats.topics_completed
        )

    @staticmethod
    def record_helpful_comment(user_id):
        """Записать полезный комментарий"""
        stats = AchievementService.get_or_create_user_stats(user_id)
        stats.helpful_comments += 1
        db.session.commit()
        
        AchievementService.update_achievement_progress(
            user_id, 'helpful_student', stats.helpful_comments
        )

    @staticmethod
    def get_user_achievements(user_id):
        """Получить все достижения пользователя"""
        achievements = Achievement.query.filter_by(user_id=user_id).all()
        result = {}
        
        for achievement in achievements:
            config = AchievementService.ACHIEVEMENTS.get(achievement.achievement_type)
            if config:
                result[achievement.achievement_type] = {
                    'id': achievement.achievement_type,
                    'title': config['title'],
                    'description': config['description'],
                    'current_progress': achievement.current_progress,
                    'max_progress': config['max_progress'],
                    'is_completed': achievement.is_completed,
                    'is_viewed': achievement.is_viewed,  # Добавляем статус просмотра
                    'completed_at': achievement.completed_at,
                    'reward_xp': config['reward_xp'],
                    'reward_badge': config['reward_badge'],
                    'category': config['category'],
                    'progress_percentage': (achievement.current_progress / config['max_progress']) * 100
                }
        
        return result

    @staticmethod
    def get_unviewed_achievements(user_id):
        """Получить непросмотренные достижения пользователя"""
        achievements = Achievement.query.filter_by(
            user_id=user_id, 
            is_completed=True, 
            is_viewed=False
        ).all()
        
        result = []
        for achievement in achievements:
            config = AchievementService.ACHIEVEMENTS.get(achievement.achievement_type)
            if config:
                result.append({
                    'id': achievement.achievement_type,
                    'title': config['title'],
                    'description': config['description'],
                    'current_progress': achievement.current_progress,
                    'max_progress': config['max_progress'],
                    'is_completed': achievement.is_completed,
                    'is_viewed': achievement.is_viewed,
                    'completed_at': achievement.completed_at,
                    'reward_xp': config['reward_xp'],
                    'reward_badge': config['reward_badge'],
                    'category': config['category'],
                    'progress_percentage': (achievement.current_progress / config['max_progress']) * 100
                })
        
        return result

    @staticmethod
    def mark_achievement_as_viewed(user_id, achievement_type):
        """Отметить достижение как просмотренное"""
        achievement = Achievement.query.filter_by(
            user_id=user_id, 
            achievement_type=achievement_type
        ).first()
        
        if achievement:
            achievement.is_viewed = True
            db.session.commit()
            return True
        return False

    @staticmethod
    def mark_all_achievements_as_viewed(user_id):
        """Отметить все достижения пользователя как просмотренные"""
        achievements = Achievement.query.filter_by(
            user_id=user_id, 
            is_completed=True, 
            is_viewed=False
        ).all()
        
        for achievement in achievements:
            achievement.is_viewed = True
        
        db.session.commit()
        return len(achievements)

    @staticmethod
    def get_user_stats(user_id):
        """Получить статистику пользователя"""
        stats = AchievementService.get_or_create_user_stats(user_id)
        return {
            'daily_streak': stats.daily_streak,
            'assignments_completed': stats.assignments_completed,
            'perfect_scores': stats.perfect_scores,
            'topics_completed': stats.topics_completed,
            'assignments_today': stats.assignments_today,
            'consistent_days': stats.consistent_days,
            'first_perfect': stats.first_perfect,
            'early_submissions': stats.early_submissions,
            'helpful_comments': stats.helpful_comments,
            'total_xp': stats.total_xp,
            'level': stats.level,
            'level_progress': stats.level_progress
        } 