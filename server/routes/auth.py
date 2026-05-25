from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from server.models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student').strip().lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required fields.'}), 400

    if role not in ['student', 'admin']:
        role = 'student'

    try:
        # Check if email exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'An account with this email address already exists.'}), 400

        user = User(name=name, email=email, role=role)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Generate access token
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Registration successful.',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create account: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    try:
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password.'}), 401

        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Login successful.',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': f'Login failure: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User session not found.'}), 404
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': f'Could not load profile: {str(e)}'}), 500
