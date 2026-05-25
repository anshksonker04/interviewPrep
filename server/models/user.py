import datetime
import bcrypt
from server.database.db import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='student', nullable=False)  # 'student' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # Relationships
    attempts = db.relationship('Attempt', backref='user', cascade='all, delete-orphan', lazy=True)
    bookmarks = db.relationship('Bookmark', backref='user', cascade='all, delete-orphan', lazy=True)

    def set_password(self, password):
        """Hashes the password using bcrypt and stores it."""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Verifies a plaintext password against the stored bcrypt hash."""
        if not self.password_hash:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False

    def to_dict(self):
        """Serializes the user object into a dictionary for API communication."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }
