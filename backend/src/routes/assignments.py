from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db, Assignment, Topic, User
from src.utils.jwt_utils import token_required, teacher_required
from src.utils.notification_utils import send_new_assignment_notification

assignments_bp = Blueprint('assignments', __name__)

@assignments_bp.route('/', methods=['GET'])
@token_required
def get_assignments(current_user):
    """Get assignments (filtered by user role)"""
    try:
        if current_user.is_admin():
            # Admin sees all assignments
            assignments = Assignment.query.all()
        elif current_user.is_teacher():
            # Teachers see assignments from their topics
            assignments = Assignment.query.join(Topic).filter(Topic.teacher_id == current_user.id).all()
        else:
            # Students see all assignments
            assignments = Assignment.query.all()
        
        return jsonify({
            'assignments': [assignment.to_dict() for assignment in assignments]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch assignments: {str(e)}'}), 500

@assignments_bp.route('/<int:assignment_id>', methods=['GET'])
@token_required
def get_assignment(current_user, assignment_id):
    """Get specific assignment"""
    try:
        assignment = Assignment.query.get(assignment_id)
        if not assignment:
            return jsonify({'message': 'Assignment not found'}), 404
        
        # Check access permissions
        if current_user.is_student():
            # Students can view any assignment
            return jsonify({
                'assignment': assignment.to_dict()
            }), 200
        elif current_user.is_teacher() and not current_user.is_admin():
            # Teachers can only view assignments from their topics
            if assignment.topic.teacher_id != current_user.id:
                return jsonify({'message': 'Access denied'}), 403
        
        # Admin or authorized teacher - show with submissions
        return jsonify({
            'assignment': assignment.to_dict_with_submissions()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch assignment: {str(e)}'}), 500

@assignments_bp.route('/', methods=['POST'])
@token_required
@teacher_required
def create_assignment(current_user):
    """Create new assignment (teachers and admins only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['topic_id', 'title', 'description', 'instructions']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if topic exists and user has access
        topic = Topic.query.get(data['topic_id'])
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        if not current_user.is_admin() and topic.teacher_id != current_user.id:
            return jsonify({'message': 'You can only create assignments for your own topics'}), 403
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            try:
                due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'message': 'Invalid due_date format. Use ISO format.'}), 400
        
        # Create new assignment
        assignment = Assignment(
            topic_id=data['topic_id'],
            title=data['title'],
            description=data['description'],
            instructions=data['instructions'],
            due_date=due_date,
            max_score=data.get('max_score', 100)
        )
        
        db.session.add(assignment)
        db.session.commit()
        
        # 🆕 Отправляем уведомления о новом задании всем студентам
        try:
            print(f"📧 Отправка уведомлений о новом задании '{assignment.title}'...")
            send_new_assignment_notification(assignment)
        except Exception as notification_error:
            print(f"⚠️ Не удалось отправить уведомления: {str(notification_error)}")
            # Не прерываем создание задания из-за ошибок с уведомлениями
        
        return jsonify({
            'message': 'Assignment created successfully',
            'assignment': assignment.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create assignment: {str(e)}'}), 500

@assignments_bp.route('/<int:assignment_id>', methods=['PUT'])
@token_required
@teacher_required
def update_assignment(current_user, assignment_id):
    """Update assignment (only by topic creator or admin)"""
    try:
        assignment = Assignment.query.get(assignment_id)
        if not assignment:
            return jsonify({'message': 'Assignment not found'}), 404
        
        # Check if user can edit this assignment
        if not current_user.is_admin() and assignment.topic.teacher_id != current_user.id:
            return jsonify({'message': 'You can only edit assignments from your own topics'}), 403
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            assignment.title = data['title']
        if 'description' in data:
            assignment.description = data['description']
        if 'instructions' in data:
            assignment.instructions = data['instructions']
        if 'max_score' in data:
            assignment.max_score = data['max_score']
        if 'due_date' in data:
            if data['due_date']:
                try:
                    assignment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'message': 'Invalid due_date format. Use ISO format.'}), 400
            else:
                assignment.due_date = None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Assignment updated successfully',
            'assignment': assignment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update assignment: {str(e)}'}), 500

@assignments_bp.route('/<int:assignment_id>', methods=['DELETE'])
@token_required
@teacher_required
def delete_assignment(current_user, assignment_id):
    """Delete assignment (only by topic creator or admin)"""
    try:
        assignment = Assignment.query.get(assignment_id)
        if not assignment:
            return jsonify({'message': 'Assignment not found'}), 404
        
        # Check if user can delete this assignment
        if not current_user.is_admin() and assignment.topic.teacher_id != current_user.id:
            return jsonify({'message': 'You can only delete assignments from your own topics'}), 403
        
        db.session.delete(assignment)
        db.session.commit()
        
        return jsonify({'message': 'Assignment deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete assignment: {str(e)}'}), 500

@assignments_bp.route('/topic/<int:topic_id>', methods=['GET'])
@token_required
def get_assignments_by_topic(current_user, topic_id):
    """Get all assignments for a specific topic"""
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        assignments = Assignment.query.filter_by(topic_id=topic_id).all()
        
        return jsonify({
            'assignments': [assignment.to_dict() for assignment in assignments]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch assignments: {str(e)}'}), 500