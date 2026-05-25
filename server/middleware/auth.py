from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from server.models.user import User

def admin_required():
    """Custom decorator to enforce admin privileges on protected endpoints."""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                # Ensure a valid JWT token exists in the headers
                verify_jwt_in_request()
                current_user_id = get_jwt_identity()
                
                # Fetch user details to verify role
                user = User.query.get(current_user_id)
                if not user or user.role != 'admin':
                    return jsonify({'error': 'Unauthorized. Admin access required.'}), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': str(e)}), 401
        return decorator
    return wrapper
