from src.models.user import db
from datetime import datetime

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    instructions = db.Column(db.Text)  # Detailed instructions for the assignment
    due_date = db.Column(db.DateTime)
    max_score = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    submissions = db.relationship('Submission', backref='assignment', lazy=True, cascade='all, delete-orphan')

    def __init__(self, topic_id, title, description, instructions, due_date=None, max_score=100):
        self.topic_id = topic_id
        self.title = title
        self.description = description
        self.instructions = instructions
        self.due_date = due_date
        self.max_score = max_score

    def is_overdue(self):
        if self.due_date:
            return datetime.utcnow() > self.due_date
        return False

    def __repr__(self):
        return f'<Assignment {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'topic_id': self.topic_id,
            'title': self.title,
            'description': self.description,
            'instructions': self.instructions,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_score': self.max_score,
            'is_overdue': self.is_overdue(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'submissions_count': len(self.submissions)
        }

    def to_dict_with_submissions(self):
        data = self.to_dict()
        data['submissions'] = [submission.to_dict() for submission in self.submissions]
        return data

