from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from server.config import Config
from server.database.db import db

# Import routing blueprints
from server.routes.auth import auth_bp
from server.routes.quizzes import quizzes_bp
from server.routes.questions import questions_bp
from server.routes.attempts import attempts_bp
from server.routes.bookmarks import bookmarks_bp
from server.routes.users import users_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for full-stack API exchange between client (5173) and server (5000)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Bind extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Custom JWT Error handlers to return premium JSON messages instead of HTML defaults
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Your authentication token has expired. Please log in again.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid authentication token. Request denied.'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token is missing. Access denied.'}), 401

    # Register modular Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(quizzes_bp, url_prefix='/api/quizzes')
    app.register_blueprint(questions_bp, url_prefix='/api/questions')
    app.register_blueprint(attempts_bp, url_prefix='/api/attempts')
    app.register_blueprint(bookmarks_bp, url_prefix='/api/bookmarks')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    # Basic root status endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Interview Preparation Portal REST API',
            'version': '1.0.0'
        }), 200

    # Global Exception Handler
    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({'error': 'An internal server error occurred. Please try again later.'}), 500

    @app.errorhandler(404)
    def page_not_found(e):
        return jsonify({'error': 'The requested API resource does not exist.'}), 404

    return app

if __name__ == '__main__':
    app = create_app()
    # Run server locally on standard port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
