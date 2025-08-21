from flask import Blueprint, request, jsonify
from src.models import db, Submission, Assignment, User
from src.utils.jwt_utils import token_required, teacher_required
from src.utils.notification_utils import send_grade_notification
from src.services.achievement_service import AchievementService

submissions_bp = Blueprint('submissions', __name__)

@submissions_bp.route('/', methods=['GET'])
@token_required
def get_submissions(current_user):
    """Get submissions (filtered by user role)"""
    try:
        if current_user.is_admin():
            # Admin sees all submissions
            submissions = Submission.query.all()
        elif current_user.is_teacher():
            # Teachers see submissions for their assignments
            submissions = Submission.query.join(Assignment).join(Assignment.topic).filter(
                Assignment.topic.has(teacher_id=current_user.id)
            ).all()
        else:
            # Students see only their own submissions
            submissions = Submission.query.filter_by(student_id=current_user.id).all()
        
        return jsonify({
            'submissions': [
                submission.to_dict() if not current_user.is_student() 
                else submission.to_dict_for_student() 
                for submission in submissions
            ]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch submissions: {str(e)}'}), 500

@submissions_bp.route('/<int:submission_id>', methods=['GET'])
@token_required
def get_submission(current_user, submission_id):
    """Get specific submission"""
    try:
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({'message': 'Submission not found'}), 404
        
        # Check access permissions
        if current_user.is_student():
            if submission.student_id != current_user.id:
                return jsonify({'message': 'You can only view your own submissions'}), 403
            return jsonify({
                'submission': submission.to_dict_for_student()
            }), 200
        elif current_user.is_teacher() and not current_user.is_admin():
            # Teachers can only view submissions for their assignments
            if submission.assignment.topic.teacher_id != current_user.id:
                return jsonify({'message': 'Access denied'}), 403
        
        return jsonify({
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch submission: {str(e)}'}), 500

@submissions_bp.route('/', methods=['POST'])
@token_required
def create_submission(current_user):
    """Submit assignment (students only)"""
    try:
        if not current_user.is_student():
            return jsonify({'message': 'Only students can submit assignments'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['assignment_id', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if assignment exists
        assignment = Assignment.query.get(data['assignment_id'])
        if not assignment:
            return jsonify({'message': 'Assignment not found'}), 404
        
        # Check if student already submitted this assignment
        existing_submission = Submission.query.filter_by(
            assignment_id=data['assignment_id'],
            student_id=current_user.id
        ).first()
        
        if existing_submission:
            return jsonify({'message': 'You have already submitted this assignment'}), 400
        
        # Validate file information if provided
        file_path = data.get("file_path")
        file_name = data.get("file_name")
        
        if file_path:
            # Check if file actually exists on disk
            import os
            upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
            full_file_path = os.path.join(upload_folder, file_path)
            
            if not os.path.exists(full_file_path) or not os.path.isfile(full_file_path):
                return jsonify({'message': 'Referenced file does not exist'}), 400
            
            # Verify file belongs to this student and assignment
            if not file_path.startswith(f"assignment_{data['assignment_id']}_student_{current_user.id}_"):
                return jsonify({'message': 'Invalid file reference'}), 400
        
        # Create new submission
        submission = Submission(
            assignment_id=data["assignment_id"],
            student_id=current_user.id,
            content=data["content"],
            file_path=file_path,
            file_name=file_name
        )
        db.session.add(submission)
        db.session.commit()
        
        # Записываем достижение за отправку задания
        try:
            AchievementService.record_assignment_submission(
                current_user.id, 
                data["assignment_id"], 
                submission.submitted_at
            )
        except Exception as e:
            # Логируем ошибку, но не прерываем выполнение
            print(f"Error recording achievement: {e}")
        
        return jsonify({
            'message': 'Assignment submitted successfully',
            'submission': submission.to_dict_for_student()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to submit assignment: {str(e)}'}), 500

@submissions_bp.route('/<int:submission_id>', methods=['PUT'])
@token_required
def update_submission(current_user, submission_id):
    """Update submission (students can edit content, teachers can grade)"""
    try:
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({'message': 'Submission not found'}), 404
        
        data = request.get_json()
        
        # Сохраняем информацию о том, была ли работа ранее оценена
        was_previously_graded = submission.is_graded()
        
        if current_user.is_student():
            # Students can only edit their own ungraded submissions
            if submission.student_id != current_user.id:
                return jsonify({'message': 'You can only edit your own submissions'}), 403
            
            if submission.is_graded():
                return jsonify({'message': 'Cannot edit graded submission'}), 400
            
            # Update content
            if 'content' in data:
                submission.content = data['content']
            
            # Validate and update file information if provided
            if 'file_path' in data or 'file_name' in data:
                new_file_path = data.get('file_path')
                new_file_name = data.get('file_name')
                
                if new_file_path:
                    # Check if file actually exists on disk
                    import os
                    upload_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
                    full_file_path = os.path.join(upload_folder, new_file_path)
                    
                    if not os.path.exists(full_file_path) or not os.path.isfile(full_file_path):
                        return jsonify({'message': 'Referenced file does not exist'}), 400
                    
                    # Verify file belongs to this student and assignment
                    if not new_file_path.startswith(f"assignment_{submission.assignment_id}_student_{current_user.id}_"):
                        return jsonify({'message': 'Invalid file reference'}), 400
                
                submission.file_path = new_file_path
                submission.file_name = new_file_name
                
        elif current_user.is_teacher() or current_user.is_admin():
            # Teachers can grade submissions
            if current_user.is_teacher() and not current_user.is_admin():
                # Check if teacher owns the assignment
                if submission.assignment.topic.teacher_id != current_user.id:
                    return jsonify({'message': 'You can only grade submissions for your assignments'}), 403
            
            # Update grade and feedback
            if 'score' in data:
                submission.score = data['score']
            if 'feedback' in data:
                submission.feedback = data['feedback']
            
            # Проверяем, является ли оценка отличной (90% и выше)
            if 'score' in data and submission.score and submission.assignment.max_score:
                percentage = (submission.score / submission.assignment.max_score) * 100
                if percentage >= 90:
                    try:
                        AchievementService.record_perfect_score(submission.student_id)
                    except Exception as e:
                        print(f"Error recording perfect score achievement: {e}")
                
            # Отправляем уведомление студенту
            if not was_previously_graded and submission.is_graded():
                    try:
                        send_grade_notification(submission)
                    except Exception as e:
                        print(f"Error sending grade notification: {e}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submission updated successfully',
            'submission': submission.to_dict() if not current_user.is_student() 
                        else submission.to_dict_for_student()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update submission: {str(e)}'}), 500

@submissions_bp.route('/<int:submission_id>', methods=['DELETE'])
@token_required
def delete_submission(current_user, submission_id):
    """Delete submission (students can delete their own ungraded submissions)"""
    try:
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({'message': 'Submission not found'}), 404
        
        # Only students can delete their own ungraded submissions, or admin
        if current_user.is_student():
            if submission.student_id != current_user.id:
                return jsonify({'message': 'You can only delete your own submissions'}), 403
            
            if submission.is_graded():
                return jsonify({'message': 'Cannot delete graded submission'}), 400
        elif current_user.is_teacher() and not current_user.is_admin():
            return jsonify({'message': 'Teachers cannot delete submissions'}), 403
        
        db.session.delete(submission)
        db.session.commit()
        
        return jsonify({'message': 'Submission deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete submission: {str(e)}'}), 500

@submissions_bp.route('/assignment/<int:assignment_id>', methods=['GET'])
@token_required
def get_submissions_by_assignment(current_user, assignment_id):
    """Get all submissions for a specific assignment"""
    try:
        assignment = Assignment.query.get(assignment_id)
        if not assignment:
            return jsonify({'message': 'Assignment not found'}), 404
        
        # Check access permissions
        if current_user.is_student():
            # Students can only see their own submission for this assignment
            submission = Submission.query.filter_by(
                assignment_id=assignment_id,
                student_id=current_user.id
            ).first()
            
            submissions = [submission] if submission else []
            return jsonify({
                'submissions': [submission.to_dict_for_student() for submission in submissions]
            }), 200
            
        elif current_user.is_teacher() and not current_user.is_admin():
            # Teachers can only see submissions for their assignments
            if assignment.topic.teacher_id != current_user.id:
                return jsonify({'message': 'Access denied'}), 403
        
        # Admin or authorized teacher
        submissions = Submission.query.filter_by(assignment_id=assignment_id).all()
        
        return jsonify({
            'submissions': [submission.to_dict() for submission in submissions]
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to fetch submissions: {str(e)}'}), 500

@submissions_bp.route('/my', methods=['GET'])
@token_required
def get_my_submissions(current_user):
    """Get current user's submissions (students only)"""
    try:
        if not current_user.is_student():
            return jsonify({'message': 'Only students can view their submissions'}), 403
        
        submissions = Submission.query.filter_by(student_id=current_user.id).all()
        
        return jsonify({
            'submissions': [submission.to_dict_for_student() for submission in submissions]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch your submissions: {str(e)}'}), 500