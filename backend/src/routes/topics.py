from flask import Blueprint, request, jsonify
from src.models import db, Topic, Discipline, User
from src.utils.jwt_utils import token_required, teacher_required

topics_bp = Blueprint('topics', __name__)

@topics_bp.route('/', methods=['GET'])
def get_topics():
    """Get all topics (public access)"""
    try:
        discipline_id = request.args.get('discipline_id')
        if discipline_id:
            # Filter topics by discipline
            topics = Topic.query.filter_by(discipline_id=discipline_id).all()
        else:
            # Get all topics
            topics = Topic.query.all()
        
        return jsonify({
            'topics': [topic.to_dict() for topic in topics]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch topics: {str(e)}'}), 500

@topics_bp.route('/<int:topic_id>', methods=['GET'])
def get_topic(topic_id):
    """Get specific topic with assignments"""
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        return jsonify({
            'topic': topic.to_dict_with_assignments()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch topic: {str(e)}'}), 500

@topics_bp.route('/', methods=['POST'])
@token_required
@teacher_required
def create_topic(current_user):
    """Create new topic (teachers and admins only)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'content', 'discipline_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if discipline exists
        discipline = Discipline.query.get(data['discipline_id'])
        if not discipline:
            return jsonify({'message': 'Discipline not found'}), 404
        
        # Create new topic
        topic = Topic(
            title=data['title'],
            description=data['description'],
            content=data['content'],
            discipline_id=data['discipline_id'],
            teacher_id=current_user.id
        )
        
        db.session.add(topic)
        db.session.commit()
        
        return jsonify({
            'message': 'Topic created successfully',
            'topic': topic.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create topic: {str(e)}'}), 500

@topics_bp.route('/<int:topic_id>', methods=['PUT'])
@token_required
@teacher_required
def update_topic(current_user, topic_id):
    """Update topic (only by creator or admin)"""
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        # Check if user can edit this topic
        if not current_user.is_admin() and topic.teacher_id != current_user.id:
            return jsonify({'message': 'You can only edit your own topics'}), 403
        
        data = request.get_json()
        
        # Update fields if provided
        if 'title' in data:
            topic.title = data['title']
        if 'description' in data:
            topic.description = data['description']
        if 'content' in data:
            topic.content = data['content']
        if 'discipline_id' in data:
            # Check if discipline exists
            discipline = Discipline.query.get(data['discipline_id'])
            if not discipline:
                return jsonify({'message': 'Discipline not found'}), 404
            topic.discipline_id = data['discipline_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Topic updated successfully',
            'topic': topic.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update topic: {str(e)}'}), 500

@topics_bp.route('/<int:topic_id>', methods=['DELETE'])
@token_required
@teacher_required
def delete_topic(current_user, topic_id):
    """Delete topic (only by creator or admin)"""
    try:
        topic = Topic.query.get(topic_id)
        if not topic:
            return jsonify({'message': 'Topic not found'}), 404
        
        # Check if user can delete this topic
        if not current_user.is_admin() and topic.teacher_id != current_user.id:
            return jsonify({'message': 'You can only delete your own topics'}), 403
        
        db.session.delete(topic)
        db.session.commit()
        
        return jsonify({'message': 'Topic deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete topic: {str(e)}'}), 500

@topics_bp.route('/my', methods=['GET'])
@token_required
@teacher_required
def get_my_topics(current_user):
    """Get topics created by current teacher"""
    try:
        discipline_id = request.args.get('discipline_id')
        query = Topic.query.filter_by(teacher_id=current_user.id)
        
        if discipline_id:
            query = query.filter_by(discipline_id=discipline_id)
            
        topics = query.all()
        return jsonify({
            'topics': [topic.to_dict() for topic in topics]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch your topics: {str(e)}'}), 500

@topics_bp.route('/by-discipline/<int:discipline_id>', methods=['GET'])
def get_topics_by_discipline(discipline_id):
    """Get all topics for a specific discipline"""
    try:
        discipline = Discipline.query.get(discipline_id)
        if not discipline:
            return jsonify({'message': 'Discipline not found'}), 404
            
        topics = Topic.query.filter_by(discipline_id=discipline_id).all()
        return jsonify({
            'discipline': discipline.to_dict(),
            'topics': [topic.to_dict() for topic in topics]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Failed to fetch topics for discipline: {str(e)}'}), 500

