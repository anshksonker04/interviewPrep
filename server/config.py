import os
from datetime import timedelta
from dotenv import load_dotenv

# Load env variables from server/.env if present
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-session-secret')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "interview_prep.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Extended configurations
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-fallback-secret-key-123')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Generous token duration for portal testing
    JWT_HEADER_TYPE = 'Bearer'
