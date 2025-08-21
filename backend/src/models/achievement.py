from src.models.user import db
from datetime import datetime

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_type = db.Column(db.String(50), nullable=False)  # daily_streak_3, assignments_completed_3, etc.
    current_progress = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)
    is_viewed = db.Column(db.Boolean, default=False)  # Новое поле для отслеживания просмотра
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь с пользователем
    user = db.relationship('User', backref='achievements')

class UserStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    daily_streak = db.Column(db.Integer, default=0)
    last_visit_date = db.Column(db.Date, nullable=True)
    assignments_completed = db.Column(db.Integer, default=0)
    perfect_scores = db.Column(db.Integer, default=0)
    topics_completed = db.Column(db.Integer, default=0)
    assignments_today = db.Column(db.Integer, default=0)
    last_assignment_date = db.Column(db.Date, nullable=True)
    consistent_days = db.Column(db.Integer, default=0)
    first_perfect = db.Column(db.Boolean, default=False)
    early_submissions = db.Column(db.Integer, default=0)
    helpful_comments = db.Column(db.Integer, default=0)
    total_xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    level_progress = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связь с пользователем
    user = db.relationship('User', backref='stats') 