from src.models.user import db
from datetime import datetime

class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    content = db.Column(db.Text)  # Rich text/Markdown content
    discipline_id = db.Column(db.Integer, db.ForeignKey('discipline.id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assignments = db.relationship('Assignment', backref='topic', lazy=True, cascade='all, delete-orphan')

    def __init__(self, title, description, content, discipline_id, teacher_id):
        self.title = title
        self.description = description
        self.content = content
        self.discipline_id = discipline_id
        self.teacher_id = teacher_id

    def __repr__(self):
        return f'<Topic {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'content': self.content,
            'discipline_id': self.discipline_id,
            'discipline_name': self.discipline.name if self.discipline else None,
            'teacher_id': self.teacher_id,
            'teacher_name': f"{self.teacher.first_name} {self.teacher.last_name}" if self.teacher else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'assignments_count': len(self.assignments)
        }

    def to_dict_with_assignments(self):
        data = self.to_dict()
        data['assignments'] = [assignment.to_dict() for assignment in self.assignments]
        return data

