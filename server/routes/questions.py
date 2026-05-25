from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from server.models import db, Quiz, Question
from server.middleware.auth import admin_required

questions_bp = Blueprint('questions', __name__)

@questions_bp.route('', methods=['GET'])
@admin_required()
def get_all_questions():
    try:
        quiz_id = request.args.get('quiz_id', type=int)
        page = request.args.get('page', type=int)
        limit = request.args.get('limit', type=int, default=15)

        query = Question.query
        if quiz_id:
            query = query.filter_by(quiz_id=quiz_id)

        if page:
            pagination = query.order_by(Question.id.desc()).paginate(page=page, per_page=limit, error_out=False)
            questions_list = []
            for q in pagination.items:
                q_dict = q.to_dict()
                q_dict['quiz_title'] = q.quiz.title if q.quiz else 'Unknown'
                questions_list.append(q_dict)
            return jsonify({
                'questions': questions_list,
                'total': pagination.total,
                'page': pagination.page,
                'pages': pagination.pages
            }), 200
        else:
            questions = query.order_by(Question.id.desc()).all()
            questions_list = []
            for q in questions:
                q_dict = q.to_dict()
                q_dict['quiz_title'] = q.quiz.title if q.quiz else 'Unknown'
                questions_list.append(q_dict)
            return jsonify({'questions': questions_list}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve questions: {str(e)}'}), 500

@questions_bp.route('', methods=['POST'])
@admin_required()
def add_question():
    data = request.get_json() or {}

    # Handle Bulk upload if input data is a list
    if isinstance(data, list):
        try:
            created_questions = []
            for item in data:
                quiz_id = item.get('quiz_id')
                question_text = item.get('question', '').strip()
                option_a = item.get('option_a', '').strip()
                option_b = item.get('option_b', '').strip()
                option_c = item.get('option_c', '').strip()
                option_d = item.get('option_d', '').strip()
                correct_answer = item.get('correct_answer', '').strip().upper()
                explanation = item.get('explanation', '').strip()

                if not (quiz_id and question_text and option_a and option_b and option_c and option_d and correct_answer):
                    return jsonify({'error': 'All fields are required for all questions in the list.'}), 400
                
                if not Quiz.query.get(quiz_id):
                    return jsonify({'error': f'Quiz with ID {quiz_id} does not exist.'}), 400

                new_q = Question(
                    quiz_id=quiz_id,
                    question=question_text,
                    option_a=option_a,
                    option_b=option_b,
                    option_c=option_c,
                    option_d=option_d,
                    correct_answer=correct_answer,
                    explanation=explanation
                )
                db.session.add(new_q)
                created_questions.append(new_q)
            
            db.session.commit()
            return jsonify({
                'message': f'Successfully bulk added {len(created_questions)} questions.',
                'questions': [q.to_dict() for q in created_questions]
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Bulk operation failed: {str(e)}'}), 500

    # Otherwise handle single creation
    quiz_id = data.get('quiz_id')
    question_text = data.get('question', '').strip()
    option_a = data.get('option_a', '').strip()
    option_b = data.get('option_b', '').strip()
    option_c = data.get('option_c', '').strip()
    option_d = data.get('option_d', '').strip()
    correct_answer = data.get('correct_answer', '').strip().upper()
    explanation = data.get('explanation', '').strip()

    if not (quiz_id and question_text and option_a and option_b and option_c and option_d and correct_answer):
        return jsonify({'error': 'Missing required question fields.'}), 400

    if correct_answer not in ['A', 'B', 'C', 'D']:
        return jsonify({'error': 'Correct answer must be A, B, C, or D.'}), 400

    if not Quiz.query.get(quiz_id):
        return jsonify({'error': 'Target quiz does not exist.'}), 400

    try:
        new_q = Question(
            quiz_id=quiz_id,
            question=question_text,
            option_a=option_a,
            option_b=option_b,
            option_c=option_c,
            option_d=option_d,
            correct_answer=correct_answer,
            explanation=explanation
        )
        db.session.add(new_q)
        db.session.commit()
        return jsonify({'message': 'Question added successfully.', 'question': new_q.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add question: {str(e)}'}), 500

@questions_bp.route('/<int:q_id>', methods=['PUT'])
@admin_required()
def update_question(q_id):
    try:
        q = Question.query.get(q_id)
        if not q:
            return jsonify({'error': 'Question not found.'}), 404

        data = request.get_json() or {}
        q.question = data.get('question', q.question).strip()
        q.option_a = data.get('option_a', q.option_a).strip()
        q.option_b = data.get('option_b', q.option_b).strip()
        q.option_c = data.get('option_c', q.option_c).strip()
        q.option_d = data.get('option_d', q.option_d).strip()
        q.correct_answer = data.get('correct_answer', q.correct_answer).strip().upper()
        q.explanation = data.get('explanation', q.explanation).strip()

        if q.correct_answer not in ['A', 'B', 'C', 'D']:
            return jsonify({'error': 'Correct answer must be A, B, C, or D.'}), 400

        db.session.commit()
        return jsonify({'message': 'Question updated successfully.', 'question': q.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update question: {str(e)}'}), 500

@questions_bp.route('/<int:q_id>', methods=['DELETE'])
@admin_required()
def delete_question(q_id):
    try:
        q = Question.query.get(q_id)
        if not q:
            return jsonify({'error': 'Question not found.'}), 404

        db.session.delete(q)
        db.session.commit()
        return jsonify({'message': 'Question deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete question: {str(e)}'}), 500
