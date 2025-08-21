from src.models.user import db
from datetime import datetime

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignment.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)  # Text content of the submission
    file_path = db.Column(db.String(500))  # Optional file attachment
    file_name = db.Column(db.String(255)) # Original file name
    score = db.Column(db.Integer)  # Grade (nullable until graded)
    feedback = db.Column(db.Text)  # Teacher's feedback
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    graded_at = db.Column(db.DateTime)

    def __init__(self, assignment_id, student_id, content, file_path=None, file_name=None):
        self.assignment_id = assignment_id
        self.student_id = student_id
        self.content = content
        self.file_path = file_path
        self.file_name = file_name

    def grade_submission(self, score, feedback=None):
        self.score = score
        self.feedback = feedback
        self.graded_at = datetime.utcnow()

    def is_graded(self):
        return self.score is not None

    def is_late(self):
        if self.assignment.due_date:
            return self.submitted_at > self.assignment.due_date
        return False

    def __repr__(self):
        return f'<Submission {self.id} for Assignment {self.assignment_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'student_id': self.student_id,
            'student_name': f"{self.student.first_name} {self.student.last_name}" if self.student else None,
            'content': self.content,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'score': self.score,
            'feedback': self.feedback,
            'is_graded': self.is_graded(),
            'is_late': self.is_late(),
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None
        }

    def to_dict_for_student(self):
        """Return limited information for student view"""
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'content': self.content,
            'file_path': self.file_path,
            'file_name': self.file_name,
            'score': self.score,
            'feedback': self.feedback,
            'is_graded': self.is_graded(),
            'is_late': self.is_late(),
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None
        }

