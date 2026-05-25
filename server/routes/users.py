from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import db, User
from server.middleware.auth import admin_required

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
@admin_required()
def get_all_users():
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify({'users': [u.to_dict() for u in users]}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve users: {str(e)}'}), 500

@users_bp.route('/<int:user_id>/role', methods=['PUT'])
@admin_required()
def update_user_role(user_id):
    current_admin_id = int(get_jwt_identity())
    
    if current_admin_id == user_id:
        return jsonify({'error': 'You cannot modify your own role.'}), 400

    data = request.get_json() or {}
    new_role = data.get('role', '').strip().lower()

    if new_role not in ['student', 'admin']:
        return jsonify({'error': 'Role must be student or admin.'}), 400

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        user.role = new_role
        db.session.commit()
        return jsonify({'message': f'Role updated to {new_role} successfully.', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to alter user privileges: {str(e)}'}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    current_admin_id = int(get_jwt_identity())

    if current_admin_id == user_id:
        return jsonify({'error': 'You cannot delete your own admin account.'}), 400

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to remove user account: {str(e)}'}), 500
