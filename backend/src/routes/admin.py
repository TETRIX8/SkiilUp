# backend/src/routes/admin.py
import os
import subprocess
from flask import Blueprint, request, jsonify, send_file, current_app
from src.models import db, User
from src.utils.jwt_utils import token_required, admin_required
import tempfile
import logging

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем Blueprint - ДОЛЖЕН БЫТЬ ТОЛЬКО ОДИН
admin_bp = Blueprint('admin', __name__)

# --- СУЩЕСТВУЮЩИЕ ЭНДПОИНТЫ ---

@admin_bp.route('/pending-users', methods=['GET'])
@token_required
@admin_required
def get_pending_users(current_user):
    """Get all unverified users for admin approval"""
    try:
        pending_users = User.query.filter_by(is_verified=False).all()
        return jsonify({
            'users': [user.to_dict() for user in pending_users]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching pending users: {e}")
        return jsonify({'message': f'Failed to fetch pending users: {str(e)}'}), 500

@admin_bp.route('/approve-user/<int:user_id>', methods=['POST'])
@token_required
@admin_required
def approve_user(current_user, user_id):
    """Approve a user (set is_verified to True)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        if user.is_verified:
            return jsonify({'message': 'User is already verified'}), 400
        user.is_verified = True
        db.session.commit()
        return jsonify({
            'message': f'User {user.email} has been approved',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error approving user {user_id}: {e}")
        return jsonify({'message': f'Failed to approve user: {str(e)}'}), 500

@admin_bp.route('/reject-user/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def reject_user(current_user, user_id):
    """Reject a user (delete the user account)"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        if user.is_verified:
            return jsonify({'message': 'Cannot reject verified user'}), 400
        user_email = user.email
        db.session.delete(user)
        db.session.commit()
        return jsonify({
            'message': f'User {user_email} has been rejected and removed'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error rejecting user {user_id}: {e}")
        return jsonify({'message': f'Failed to reject user: {str(e)}'}), 500

@admin_bp.route('/all-users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """Get all users for admin management"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching all users: {e}")
        return jsonify({'message': f'Failed to fetch users: {str(e)}'}), 500

@admin_bp.route('/toggle-user-verification/<int:user_id>', methods=['POST'])
@token_required
@admin_required
def toggle_user_verification(current_user, user_id):
    """Toggle user verification status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        # Don't allow admin to disable their own verification
        if user.id == current_user.id:
            return jsonify({'message': 'Cannot modify your own verification status'}), 400
        user.is_verified = not user.is_verified
        db.session.commit()
        status = 'verified' if user.is_verified else 'unverified'
        return jsonify({
            'message': f'User {user.email} is now {status}',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error toggling verification for user {user_id}: {e}")
        return jsonify({'message': f'Failed to toggle user verification: {str(e)}'}), 500

# --- НОВЫЕ ЭНДПОИНТЫ ДЛЯ РЕЗЕРВНОГО КОПИРОВАНИЯ ---

@admin_bp.route('/backup', methods=['GET'])
@token_required
@admin_required
def backup_database(current_user):
    """Создать резервную копию базы данных и отправить её как файл."""
    try:
        # Получаем путь к базе данных из конфигурации Flask
        db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
        if not db_uri.startswith('sqlite:///'):
            logger.error("Backup currently supports only SQLite")
            return jsonify({'message': 'Backup currently supports only SQLite'}), 500

        db_path = db_uri.replace('sqlite:///', '')
        if not os.path.exists(db_path):
             logger.error(f"Database file not found: {db_path}")
             return jsonify({'message': 'Database file not found'}), 500

        # Определяем имя файла резервной копии
        backup_filename = f"backup_{os.path.basename(db_path)}.sql"

        # Создаем временный файл для дампа
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.sql', delete=False) as tmpfile:
            backup_file_path = tmpfile.name

        try:
            # Используем sqlite3 CLI для создания дампа
            dump_command = ['sqlite3', db_path, '.dump']
            with open(backup_file_path, 'w') as f:
                result = subprocess.run(dump_command, stdout=f, stderr=subprocess.PIPE, text=True)

            if result.returncode != 0:
                logger.error(f"SQLite dump failed: {result.stderr}")
                os.remove(backup_file_path)
                return jsonify({'message': f'Backup failed: {result.stderr}'}), 500

            logger.info(f"Backup created successfully: {backup_filename}")
            return send_file(
                backup_file_path,
                as_attachment=True,
                download_name=backup_filename, # Для Flask >= 2.0
                mimetype='application/sql'
            )

        except Exception as e:
            logger.error(f"Error during backup process: {e}")
            if 'backup_file_path' in locals() and os.path.exists(backup_file_path):
                os.remove(backup_file_path)
            return jsonify({'message': f'Backup process failed: {str(e)}'}), 500

    except Exception as e:
        logger.error(f"Unexpected error during backup: {e}")
        return jsonify({'message': f'Unexpected backup error: {str(e)}'}), 500

@admin_bp.route('/restore', methods=['POST'])
@token_required
@admin_required
def restore_database(current_user):
    """Восстановить базу данных из загруженного .sql файла."""
    try:
        if 'backup_file' not in request.files:
            logger.warning("No file part in the request")
            return jsonify({'message': 'No file provided'}), 400

        file = request.files['backup_file']

        if file.filename == '':
            logger.warning("No file selected for uploading")
            return jsonify({'message': 'No file selected'}), 400

        if not file.filename.endswith('.sql'):
             logger.warning(f"Invalid file type uploaded: {file.filename}")
             return jsonify({'message': 'Invalid file type. Please upload a .sql file'}), 400

        db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
        if not db_uri.startswith('sqlite:///'):
            logger.error("Restore currently supports only SQLite")
            return jsonify({'message': 'Restore currently supports only SQLite'}), 500

        db_path = db_uri.replace('sqlite:///', '')
        if not os.path.exists(db_path):
             logger.error(f"Database file not found for restore: {db_path}")
             return jsonify({'message': 'Database file not found'}), 500

        with tempfile.NamedTemporaryFile(mode='wb', suffix='.sql', delete=False) as tmpfile:
            file.save(tmpfile)
            uploaded_file_path = tmpfile.name

        try:
            backup_db_path = db_path + ".bak"
            if os.path.exists(backup_db_path):
                os.remove(backup_db_path)
            os.rename(db_path, backup_db_path)
            logger.info(f"Current database backed up to {backup_db_path}")

            restore_command = ['sqlite3', db_path]
            with open(uploaded_file_path, 'r') as f:
                result = subprocess.run(restore_command, stdin=f, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

            if result.returncode != 0:
                 logger.error(f"SQLite restore failed: {result.stderr}")
                 if os.path.exists(backup_db_path):
                     os.rename(backup_db_path, db_path)
                 return jsonify({'message': f'Restore failed: {result.stderr}'}), 500

            logger.info("Database restored successfully")
            # Удаляем временную резервную копию
            os.remove(backup_db_path)

            return jsonify({'message': 'Database restored successfully. Application restart might be required.'}), 200

        except Exception as e:
             logger.error(f"Error during restore process: {e}")
             if os.path.exists(backup_db_path) and not os.path.exists(db_path):
                 os.rename(backup_db_path, db_path)
             elif os.path.exists(backup_db_path) and os.path.exists(db_path):
                 os.remove(db_path)
                 os.rename(backup_db_path, db_path)
             return jsonify({'message': f'Restore process failed: {str(e)}'}), 500

        finally:
            if os.path.exists(uploaded_file_path):
                os.remove(uploaded_file_path)

    except Exception as e:
         logger.error(f"Unexpected error during restore: {e}")
         return jsonify({'message': f'Unexpected restore error: {str(e)}'}), 500

# -------------------------------------------------------
