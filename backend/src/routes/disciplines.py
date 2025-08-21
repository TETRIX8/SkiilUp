from flask import Blueprint, request, jsonify
from src.models import db, Discipline, User
from src.utils.jwt_utils import token_required, teacher_required

disciplines_bp = Blueprint('disciplines', __name__)

@disciplines_bp.route('/', methods=['GET'])
def get_disciplines():
    """Get all disciplines (public access)"""
    try:
        disciplines = Discipline.query.all()
        return jsonify({
            'disciplines': [discipline.to_dict() for discipline in disciplines]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch disciplines: {str(e)}'}), 500

@disciplines_bp.route('/<int:discipline_id>', methods=['GET'])
def get_discipline(discipline_id):
    """Get specific discipline with topics"""
    try:
        discipline = Discipline.query.get(discipline_id)
        if not discipline:
            return jsonify({'message': 'Discipline not found'}), 404
        
        return jsonify({
            'discipline': discipline.to_dict_with_topics()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch discipline: {str(e)}'}), 500

@disciplines_bp.route('/', methods=['POST'])
@token_required
@teacher_required
def create_discipline(current_user):
    """Create new discipline (teachers and admins only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({'message': 'Name is required'}), 400
        
        # Check if discipline with this name already exists
        existing_discipline = Discipline.query.filter_by(name=data['name']).first()
        if existing_discipline:
            return jsonify({'message': 'Discipline with this name already exists'}), 400
        
        # Create new discipline
        discipline = Discipline(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(discipline)
        db.session.commit()
        
        return jsonify({
            'message': 'Discipline created successfully',
            'discipline': discipline.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create discipline: {str(e)}'}), 500

@disciplines_bp.route('/<int:discipline_id>', methods=['PUT'])
@token_required
@teacher_required
def update_discipline(current_user, discipline_id):
    """Update discipline (admins only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Only admins can update disciplines'}), 403
            
        discipline = Discipline.query.get(discipline_id)
        if not discipline:
            return jsonify({'message': 'Discipline not found'}), 404
        
        data = request.get_json()
        
        # Update fields if provided
        if 'name' in data:
            # Check for name conflicts
            existing_discipline = Discipline.query.filter(
                Discipline.name == data['name'],
                Discipline.id != discipline_id
            ).first()
            if existing_discipline:
                return jsonify({'message': 'Discipline with this name already exists'}), 400
            discipline.name = data['name']
            
        if 'description' in data:
            discipline.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Discipline updated successfully',
            'discipline': discipline.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update discipline: {str(e)}'}), 500

@disciplines_bp.route('/<int:discipline_id>', methods=['DELETE'])
@token_required
@teacher_required
def delete_discipline(current_user, discipline_id):
    """Delete discipline (admins only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Only admins can delete disciplines'}), 403
            
        discipline = Discipline.query.get(discipline_id)
        if not discipline:
            return jsonify({'message': 'Discipline not found'}), 404
        
        # Check if discipline has topics
        if discipline.topics:
            return jsonify({
                'message': 'Cannot delete discipline with existing topics. Please move or delete topics first.'
            }), 400
        
        db.session.delete(discipline)
        db.session.commit()
        
        return jsonify({'message': 'Discipline deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete discipline: {str(e)}'}), 500