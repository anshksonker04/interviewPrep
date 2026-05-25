from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import db, Bookmark, Question

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route('', methods=['POST'])
@jwt_required()
def toggle_bookmark():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    question_id = data.get('question_id')

    if not question_id:
        return jsonify({'error': 'Question ID is required.'}), 400

    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found.'}), 404

    try:
        # Check if bookmark already exists
        existing = Bookmark.query.filter_by(user_id=current_user_id, question_id=question_id).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return jsonify({'message': 'Bookmark removed successfully.', 'bookmarked': False}), 200
        else:
            new_bookmark = Bookmark(user_id=current_user_id, question_id=question_id)
            db.session.add(new_bookmark)
            db.session.commit()
            return jsonify({'message': 'Bookmark added successfully.', 'bookmarked': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to toggle bookmark: {str(e)}'}), 500

@bookmarks_bp.route('', methods=['GET'])
@jwt_required()
def get_user_bookmarks():
    current_user_id = get_jwt_identity()
    try:
        bookmarks = Bookmark.query.filter_by(user_id=current_user_id).all()
        
        # Format the bookmark to include full question detail and topic/difficulty of quiz
        formatted = []
        for b in bookmarks:
            if not b.question:
                continue
            q_dict = b.question.to_dict()
            if b.question.quiz:
                q_dict['quiz_title'] = b.question.quiz.title
                q_dict['quiz_topic'] = b.question.quiz.topic
                q_dict['quiz_difficulty'] = b.question.quiz.difficulty
            else:
                q_dict['quiz_title'] = 'Deleted Quiz'
                q_dict['quiz_topic'] = 'General'
                q_dict['quiz_difficulty'] = 'Medium'
                
            formatted.append({
                'id': b.id,
                'question_id': b.question_id,
                'question': q_dict
            })
            
        return jsonify({'bookmarks': formatted}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve bookmarked items: {str(e)}'}), 500
