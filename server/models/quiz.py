import datetime
from server.database.db import db

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    topic = db.Column(db.String(50), nullable=False, index=True)  # e.g., DBMS, OS, CN, OOPs, DSA, etc.
    difficulty = db.Column(db.String(20), nullable=False, index=True)  # Easy, Medium, Hard
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # Relationships
    questions = db.relationship('Question', backref='quiz', cascade='all, delete-orphan', lazy=True)
    attempts = db.relationship('Attempt', backref='quiz', cascade='all, delete-orphan', lazy=True)
    user_rel = db.relationship('User', backref=db.backref('quizzes_created', cascade='all, delete-orphan', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'user_id': self.user_id,
            'question_count': len(self.questions),
            'created_at': self.created_at.isoformat()
        }
