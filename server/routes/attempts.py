import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from server.models import db, Attempt, Quiz, User, Question
from server.middleware.auth import admin_required

attempts_bp = Blueprint('attempts', __name__)

def calculate_streak(attempts):
    """Calculates active quiz attempt streak (consecutive active calendar days)."""
    if not attempts:
        return 0
    
    # Gather unique dates in descending order
    attempt_dates = sorted(list({a.attempted_at.date() for a in attempts}), reverse=True)
    
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    
    # If latest attempt was neither today nor yesterday, streak is reset to 0
    if attempt_dates[0] not in [today, yesterday]:
        return 0
        
    streak = 1
    for i in range(len(attempt_dates) - 1):
        diff = attempt_dates[i] - attempt_dates[i+1]
        if diff.days == 1:
            streak += 1
        elif diff.days > 1:
            # Streak broken in history
            break
            
    return streak

@attempts_bp.route('', methods=['POST'])
@jwt_required()
def record_attempt():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    quiz_id = data.get('quiz_id')
    score = data.get('score')
    total_questions = data.get('total_questions')
    time_taken = data.get('time_taken', 0) # in seconds

    if quiz_id is None or score is None or total_questions is None:
        return jsonify({'error': 'Quiz ID, score, and total questions are required fields.'}), 400

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found.'}), 404

    accuracy = (score / total_questions * 100) if total_questions > 0 else 0.0

    try:
        new_attempt = Attempt(
            user_id=current_user_id,
            quiz_id=quiz_id,
            score=score,
            total_questions=total_questions,
            accuracy=accuracy,
            time_taken=time_taken
        )
        db.session.add(new_attempt)
        db.session.commit()
        return jsonify({
            'message': 'Attempt recorded successfully.',
            'attempt': new_attempt.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to register attempt: {str(e)}'}), 500

@attempts_bp.route('/history', methods=['GET'])
@jwt_required()
def get_attempt_history():
    current_user_id = get_jwt_identity()
    try:
        attempts = Attempt.query.filter_by(user_id=current_user_id).order_by(Attempt.attempted_at.desc()).all()
        return jsonify({'attempts': [a.to_dict() for a in attempts]}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve logs: {str(e)}'}), 500

@attempts_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_user_analytics():
    current_user_id = get_jwt_identity()
    try:
        attempts = Attempt.query.filter_by(user_id=current_user_id).order_by(Attempt.attempted_at.asc()).all()
        
        total_quizzes = len(attempts)
        if total_quizzes == 0:
            return jsonify({
                'total_attempts': 0,
                'average_score': 0,
                'average_accuracy': 0,
                'streak': 0,
                'topic_performance': [],
                'difficulty_breakdown': {},
                'recent_progress': [],
                'strong_topics': [],
                'weak_topics': []
            }), 200

        total_score = sum([a.score for a in attempts])
        total_q = sum([a.total_questions for a in attempts])
        avg_accuracy = sum([a.accuracy for a in attempts]) / total_quizzes
        avg_score = (total_score / total_q * 100) if total_q > 0 else 0.0

        # Streak
        streak = calculate_streak(attempts)

        # Topic-wise performance compile
        topic_map = {}
        for a in attempts:
            if not a.quiz:
                continue
            t = a.quiz.topic
            if t not in topic_map:
                topic_map[t] = {'scores': 0, 'questions': 0, 'attempts': 0, 'accuracies': 0.0}
            topic_map[t]['scores'] += a.score
            topic_map[t]['questions'] += a.total_questions
            topic_map[t]['attempts'] += 1
            topic_map[t]['accuracies'] += a.accuracy

        topic_performance = []
        strong_topics = []
        weak_topics = []
        for topic, stats in topic_map.items():
            avg_topic_acc = stats['accuracies'] / stats['attempts']
            topic_performance.append({
                'topic': topic,
                'attempts': stats['attempts'],
                'accuracy': round(avg_topic_acc, 2)
            })
            if avg_topic_acc >= 75.0:
                strong_topics.append(topic)
            elif avg_topic_acc < 60.0:
                weak_topics.append(topic)

        # Accuracy Trends Over Time
        recent_progress = []
        for a in attempts[-10:]: # Limit to last 10 attempts for charts
            recent_progress.append({
                'quiz': a.quiz.title if a.quiz else 'Quiz',
                'accuracy': round(a.accuracy, 2),
                'date': a.attempted_at.strftime('%b %d')
            })

        return jsonify({
            'total_attempts': total_quizzes,
            'average_score': round(avg_score, 2),
            'average_accuracy': round(avg_accuracy, 2),
            'streak': streak,
            'topic_performance': topic_performance,
            'recent_progress': recent_progress,
            'strong_topics': strong_topics,
            'weak_topics': weak_topics
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to aggregate student statistics: {str(e)}'}), 500

@attempts_bp.route('/admin/dashboard', methods=['GET'])
@admin_required()
def get_admin_dashboard_stats():
    try:
        total_users = User.query.count()
        total_quizzes = Quiz.query.count()
        total_questions = Question.query.count()
        total_attempts = Attempt.query.count()

        # Find most attempted topics
        attempts = Attempt.query.all()
        topic_counts = {}
        for a in attempts:
            if a.quiz:
                topic = a.quiz.topic
                topic_counts[topic] = topic_counts.get(topic, 0) + 1

        sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        popular_topics = [{'topic': item[0], 'attempts': item[1]} for item in sorted_topics[:5]]

        # Daily attempts tracking for administrative charts
        recent_attempts = Attempt.query.order_by(Attempt.attempted_at.desc()).limit(15).all()
        recent_activity = []
        for a in recent_attempts:
            recent_activity.append({
                'id': a.id,
                'user': a.user.name if a.user else 'Deleted Student',
                'quiz': a.quiz.title if a.quiz else 'Deleted Quiz',
                'topic': a.quiz.topic if a.quiz else 'General',
                'accuracy': round(a.accuracy, 2),
                'attempted_at': a.attempted_at.strftime('%Y-%m-%d %H:%M')
            })

        return jsonify({
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'total_questions': total_questions,
            'total_attempts': total_attempts,
            'popular_topics': popular_topics,
            'recent_activity': recent_activity
        }), 200
    except Exception as e:
        return jsonify({'error': f'Admin statistics compilation failure: {str(e)}'}), 500
