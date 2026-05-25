from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from server.models import db, Quiz, Question
from server.middleware.auth import admin_required

quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('', methods=['GET'])
@jwt_required()
def get_all_quizzes():
    try:
        # Extract search, filter, and pagination params
        topic = request.args.get('topic', '').strip()
        difficulty = request.args.get('difficulty', '').strip()
        search = request.args.get('search', '').strip()
        
        page = request.args.get('page', type=int)
        limit = request.args.get('limit', type=int, default=10)

        query = Quiz.query

        if topic:
            query = query.filter_by(topic=topic)
        if difficulty:
            query = query.filter_by(difficulty=difficulty)
        if search:
            query = query.filter(Quiz.title.ilike(f'%{search}%'))

        # Check for paginated vs full request
        if page:
            pagination = query.order_by(Quiz.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
            quizzes_list = [quiz.to_dict() for quiz in pagination.items]
            return jsonify({
                'quizzes': quizzes_list,
                'total': pagination.total,
                'page': pagination.page,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }), 200
        else:
            quizzes = query.order_by(Quiz.created_at.desc()).all()
            return jsonify({'quizzes': [q.to_dict() for q in quizzes]}), 200
            
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve quizzes: {str(e)}'}), 500

@quizzes_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz_by_id(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found.'}), 404
        
        # Structure the payload with the questions
        questions = Question.query.filter_by(quiz_id=quiz.id).all()
        quiz_data = quiz.to_dict()
        quiz_data['questions'] = [q.to_dict() for q in questions]

        return jsonify({'quiz': quiz_data}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to load quiz: {str(e)}'}), 500

@quizzes_bp.route('', methods=['POST'])
@admin_required()
def create_quiz():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    topic = data.get('topic', '').strip()
    difficulty = data.get('difficulty', '').strip()

    if not title or not topic or not difficulty:
        return jsonify({'error': 'Title, topic, and difficulty are required.'}), 400

    try:
        new_quiz = Quiz(title=title, topic=topic, difficulty=difficulty)
        db.session.add(new_quiz)
        db.session.commit()
        return jsonify({'message': 'Quiz created successfully.', 'quiz': new_quiz.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to create quiz: {str(e)}'}), 500

@quizzes_bp.route('/<int:quiz_id>', methods=['PUT'])
@admin_required()
def update_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found.'}), 404

        data = request.get_json() or {}
        quiz.title = data.get('title', quiz.title).strip()
        quiz.topic = data.get('topic', quiz.topic).strip()
        quiz.difficulty = data.get('difficulty', quiz.difficulty).strip()

        db.session.commit()
        return jsonify({'message': 'Quiz updated successfully.', 'quiz': quiz.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update quiz: {str(e)}'}), 500

@quizzes_bp.route('/<int:quiz_id>', methods=['DELETE'])
@admin_required()
def delete_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'error': 'Quiz not found.'}), 404

        db.session.delete(quiz)
        db.session.commit()
        return jsonify({'message': 'Quiz deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete quiz: {str(e)}'}), 500
