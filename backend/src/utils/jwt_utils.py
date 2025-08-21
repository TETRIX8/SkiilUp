import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from src.models import User

def generate_token(user_id, expires_in_hours=24):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=expires_in_hours),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def decode_token(token):
    """Decode JWT token and return user_id"""
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            user_id = decode_token(token)
            if user_id is None:
                return jsonify({'message': 'Token is invalid or expired'}), 401
            
            current_user = User.query.get(user_id)
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except Exception as e:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin():
            return jsonify({'message': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

def student_required(f):
    """Decorator to require student role"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_student():
            return jsonify({'message': 'Student access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def teacher_required(f):
    """Decorator to require teacher or admin role"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not (current_user.is_teacher() or current_user.is_admin()):
            return jsonify({'message': 'Teacher access required'}), 403
        return f(current_user, *args, **kwargs)
    
    return decorated

