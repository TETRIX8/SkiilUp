# backend/src/routes/auth.py
from flask import Blueprint, request, jsonify
from src.models import db, User
from src.utils.jwt_utils import generate_token, decode_token, token_required
from src.utils.email_utils import send_verification_email, send_password_reset_email
from src.utils.notification_utils import send_sms_verification_code, send_password_reset_notification
import secrets
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'User with this email already exists'}), 400
        
        # Determine role (default is student, admin can create teachers)
        role = data.get('role', 'student')
        if role not in ['student', 'teacher']:
            role = 'student'
        
        # Create new user
        user = User(
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=role
        )
        
        db.session.add(user)
        db.session.commit()
        
        # 🆕 Отправляем SMS-код подтверждения
        try:
            print(f"📱 Отправка SMS-кода подтверждения для {user.email}...")
            send_sms_verification_code(user)
        except Exception as notification_error:
            print(f"⚠️ Не удалось отправить SMS-код: {str(notification_error)}")

        return jsonify({
            'message': 'User registered successfully. SMS verification code has been sent to your email.',
            'user': user.to_dict()
        }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'message': 'Email is required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Don't reveal if user exists or not
            return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.verification_token = reset_token  # Reuse verification_token field for reset
        db.session.commit()
        
        # 🆕 Используем новый красивый email сервис для восстановления пароля
        try:
            print(f"🔐 Отправка письма восстановления пароля для {user.email}...")
            send_password_reset_notification(user, reset_token)
        except Exception as notification_error:
            print(f"⚠️ Не удалось отправить письмо восстановления: {str(notification_error)}")
            # В случае ошибки используем старый способ
            if send_password_reset_email(user, reset_token):
                return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
            else:
                return jsonify({'message': 'Failed to send password reset email'}), 500
        
        return jsonify({'message': 'If the email exists, a password reset link has been sent'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Password reset failed: {str(e)}'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password"""
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'message': 'Token and new password are required'}), 400
        
        # Find user by reset token
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            return jsonify({'message': 'Invalid or expired reset token'}), 400
        
        # Update password
        user.set_password(new_password)
        user.verification_token = None  # Clear the token
        db.session.commit()
        
        return jsonify({'message': 'Password reset successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Password reset failed: {str(e)}'}), 500


# --- НОВЫЙ ЭНДПОИНТ ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ ---
@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile (first_name, last_name)"""
    try:
        data = request.get_json()

        # Валидация входных данных
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        # Обновляем только разрешенные поля
        allowed_fields = ['first_name', 'last_name']
        updated = False

        for field in allowed_fields:
            if field in data:
                new_value = data.get(field, '').strip()
                if new_value: # Проверяем, что значение не пустое
                    setattr(current_user, field, new_value)
                    updated = True
                else:
                    # Можно вернуть ошибку, если поле обязательно
                    # return jsonify({'message': f'{field} cannot be empty'}), 400
                    # Или просто проигнорировать пустое значение
                    pass

        if updated:
            # Обновляем поле updated_at
            current_user.updated_at = datetime.utcnow()
            db.session.commit()

            return jsonify({
                'message': 'Profile updated successfully',
                'user': current_user.to_dict()
            }), 200
        else:
            return jsonify({'message': 'No valid fields to update'}), 400

    except Exception as e:
        db.session.rollback()
        print(f"Error updating profile: {e}") # Для отладки
        return jsonify({'message': f'Failed to update profile: {str(e)}'}), 500
# -------------------------------------------------
