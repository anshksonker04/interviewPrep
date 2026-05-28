import datetime
from server.database.db import db

class QuizProgress(db.Model):
    __tablename__ = 'quiz_progresses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    current_question_index = db.Column(db.Integer, default=0, nullable=False)
    time_remaining = db.Column(db.Integer, nullable=False)
    answers = db.Column(db.Text, default='{}', nullable=False)  # Serialized JSON string of question_id -> answer
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user_rel = db.relationship('User', backref=db.backref('quiz_progresses', cascade='all, delete-orphan', lazy=True))
    quiz_rel = db.relationship('Quiz', backref=db.backref('quiz_progresses', cascade='all, delete-orphan', lazy=True))

    def to_dict(self):
        import json
        try:
            parsed_answers = json.loads(self.answers)
        except Exception:
            parsed_answers = {}
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'current_question_index': self.current_question_index,
            'time_remaining': self.time_remaining,
            'answers': parsed_answers,
            'updated_at': self.updated_at.isoformat()
        }
