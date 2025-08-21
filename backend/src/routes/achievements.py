from flask import Blueprint, request, jsonify
from src.utils.jwt_utils import token_required
from src.services.achievement_service import AchievementService
from src.models.user import User

achievements_bp = Blueprint('achievements', __name__)

@achievements_bp.route('/', methods=['GET'])
@token_required
def get_achievements(current_user):
    """Получить достижения пользователя"""
    try:
        achievements = AchievementService.get_user_achievements(current_user.id)
        
        return jsonify({
            'success': True,
            'achievements': achievements
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    """Получить статистику пользователя"""
    try:
        stats = AchievementService.get_user_stats(current_user.id)
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/visit', methods=['POST'])
@token_required
def record_visit(current_user):
    """Записать посещение пользователя"""
    try:
        AchievementService.record_daily_visit(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Посещение записано'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/submission', methods=['POST'])
@token_required
def record_submission(current_user):
    """Записать отправку задания"""
    try:
        data = request.get_json()
        
        assignment_id = data.get('assignment_id')
        submitted_at = data.get('submitted_at')
        
        if not assignment_id:
            return jsonify({
                'success': False,
                'message': 'assignment_id обязателен'
            }), 400
        
        AchievementService.record_assignment_submission(
            current_user.id, 
            assignment_id, 
            submitted_at
        )
        
        return jsonify({
            'success': True,
            'message': 'Отправка задания записана'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/perfect-score', methods=['POST'])
@token_required
def record_perfect_score(current_user):
    """Записать отличную оценку"""
    try:
        AchievementService.record_perfect_score(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Отличная оценка записана'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/topic-completion', methods=['POST'])
@token_required
def record_topic_completion(current_user):
    """Записать завершение темы"""
    try:
        data = request.get_json()
        topic_id = data.get('topic_id')
        
        if not topic_id:
            return jsonify({
                'success': False,
                'message': 'topic_id обязателен'
            }), 400
        
        AchievementService.record_topic_completion(current_user.id, topic_id)
        
        return jsonify({
            'success': True,
            'message': 'Завершение темы записано'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/helpful-comment', methods=['POST'])
@token_required
def record_helpful_comment(current_user):
    """Записать полезный комментарий"""
    try:
        AchievementService.record_helpful_comment(current_user.id)
        
        return jsonify({
            'success': True,
            'message': 'Полезный комментарий записан'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/unviewed', methods=['GET'])
@token_required
def get_unviewed_achievements(current_user):
    """Получить непросмотренные достижения пользователя"""
    try:
        unviewed_achievements = AchievementService.get_unviewed_achievements(current_user.id)
        
        return jsonify({
            'success': True,
            'achievements': unviewed_achievements
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/mark-viewed', methods=['POST'])
@token_required
def mark_achievement_as_viewed(current_user):
    """Отметить достижение как просмотренное"""
    try:
        data = request.get_json()
        achievement_type = data.get('achievement_type')
        
        if not achievement_type:
            return jsonify({
                'success': False,
                'message': 'achievement_type обязателен'
            }), 400
        
        success = AchievementService.mark_achievement_as_viewed(current_user.id, achievement_type)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Достижение отмечено как просмотренное'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Достижение не найдено'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@achievements_bp.route('/mark-all-viewed', methods=['POST'])
@token_required
def mark_all_achievements_as_viewed(current_user):
    """Отметить все достижения как просмотренные"""
    try:
        count = AchievementService.mark_all_achievements_as_viewed(current_user.id)
        
        return jsonify({
            'success': True,
            'message': f'{count} достижений отмечено как просмотренные'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 