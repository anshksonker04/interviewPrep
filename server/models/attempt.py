import datetime
from server.database.db import db

class Attempt(db.Model):
    __tablename__ = 'attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)  # score / total_questions * 100
    time_taken = db.Column(db.Integer, nullable=False)  # stored in seconds
    attempted_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'quiz_title': self.quiz.title if self.quiz else 'Unknown Quiz',
            'quiz_topic': self.quiz.topic if self.quiz else 'Unknown Topic',
            'score': self.score,
            'total_questions': self.total_questions,
            'accuracy': round(self.accuracy, 2),
            'time_taken': self.time_taken,
            'attempted_at': self.attempted_at.isoformat()
        }
