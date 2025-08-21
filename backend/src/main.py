import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge
from src.models import db, User, Discipline, Topic, Assignment, Submission
from src.models.achievement import Achievement, UserStats
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.admin import admin_bp
from src.routes.disciplines import disciplines_bp
from src.routes.topics import topics_bp
from src.routes.assignments import assignments_bp
from src.routes.submissions import submissions_bp
from src.routes.file_upload import file_upload_bp
from src.routes.achievements import achievements_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Увеличиваем лимит размера файла до 100MB
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

# Конфигурация базового URL для генерации ссылок
app.config['BACKEND_BASE_URL'] = os.environ.get('BACKEND_BASE_URL', 'https://tetrixuno.ddns.net')

# Логируем значение для отладки
print(f"BACKEND_BASE_URL configured as: {app.config['BACKEND_BASE_URL']}")

# Дополнительные настройки для больших файлов
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Улучшенная CORS конфигурация
allowed_origins = [
    "https://skiil-up.vercel.app",
    "http://localhost:3000",
    "https://skiil-up-git-develop-tetrix8s-projects.vercel.app",
]
CORS(
    app,
    resources={r"/api/*": {"origins": allowed_origins}},
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Content-Length", "Accept-Ranges"],
    supports_credentials=True,
    expose_headers=["Content-Type", "Authorization", "Content-Length", "Accept-Ranges"],
    max_age=3600,
)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(disciplines_bp, url_prefix='/api/disciplines')
app.register_blueprint(topics_bp, url_prefix='/api/topics')
app.register_blueprint(assignments_bp, url_prefix='/api/assignments')
app.register_blueprint(submissions_bp, url_prefix='/api/submissions')
app.register_blueprint(file_upload_bp, url_prefix='/api/files')
app.register_blueprint(achievements_bp, url_prefix='/api/achievements')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_admin_user():
    """Create default admin user if doesn't exist"""
    admin_email = 'tetrixuno@gmail.com'
    admin = User.query.filter_by(email=admin_email).first()
    
    if not admin:
        admin = User(
            email=admin_email,
            password='admin123',  # Default password - should be changed
            first_name='Admin',
            last_name='User',
            role='admin'
        )
        admin.is_verified = True  # Admin is pre-verified
        db.session.add(admin)
        db.session.commit()
        print(f"Admin user created: {admin_email}")
    else:
        print(f"Admin user already exists: {admin_email}")

with app.app_context():
    db.create_all()
    create_admin_user()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Не обрабатываем API маршруты
    if path.startswith('api/'):
        return "API endpoint not found", 404
        
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Обработчики ошибок
@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({
        'message': 'File size too large. Maximum allowed size is 100MB'
    }), 413

@app.errorhandler(413)
def handle_413_error(e):
    return jsonify({
        'message': 'File size too large. Maximum allowed size is 100MB'
    }), 413

@app.errorhandler(500)
def handle_500_error(e):
    return jsonify({
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
