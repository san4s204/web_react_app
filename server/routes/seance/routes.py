from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from init import db
from models import Seance, User, Beacon
from datetime import datetime

seance_bp = Blueprint('seance_bp', __name__)

def format_date(date):
    return date.strftime("%Y-%m-%dT%H:%M")

@seance_bp.route('/seances', methods=['GET'])
@jwt_required()
def get_seances():
    current_user_id = get_jwt_identity()['id']
    current_user = User.query.get(current_user_id)
    
   # Check if the current user is an admin by looking at role_name in roles
    is_admin = any(role.role_name == 'admin' for role in current_user.roles)
    print(is_admin)
    # If the current user is an admin, retrieve all seances
    if is_admin:
        seances = Seance.query.all()
    else:
        seances = Seance.query.filter_by(id_user=current_user_id).all()
    
    seance_list = [{
        'id': seance.id,
        'id_beacon': seance.id_beacon,
        'id_user': seance.id_user,
        'data_start': format_date(seance.data_start),
        'data_end': format_date(seance.data_end),
        'description': seance.description
    } for seance in seances]
    return jsonify(seance_list)

@seance_bp.route('/seances', methods=['POST'])
@jwt_required()
def add_seance():
    data = request.get_json()
    new_seance = Seance(
        id_beacon=data.get('id_beacon'),
        id_user=data.get('id_user'),
        data_start=datetime.strptime(data.get('data_start'), "%Y-%m-%dT%H:%M"),
        data_end=datetime.strptime(data.get('data_end'), "%Y-%m-%dT%H:%M"),
        description=data.get('description')
    )
    db.session.add(new_seance)
    db.session.commit()
    return jsonify({
        'id': new_seance.id,
        'id_beacon': new_seance.id_beacon,
        'id_user': new_seance.id_user,
        'data_start': format_date(new_seance.data_start),
        'data_end': format_date(new_seance.data_end),
        'description': new_seance.description
    }), 201

@seance_bp.route('/seances/<int:id>', methods=['PUT'])
@jwt_required()
def update_seance(id):
    seance = Seance.query.get_or_404(id)
    data = request.get_json()
    seance.id_beacon = data.get('id_beacon', seance.id_beacon)
    seance.id_user = data.get('id_user', seance.id_user)
    seance.data_start = datetime.strptime(data.get('data_start'), "%Y-%m-%dT%H:%M") if data.get('data_start') else seance.data_start
    seance.data_end = datetime.strptime(data.get('data_end'), "%Y-%m-%dT%H:%M") if data.get('data_end') else seance.data_end
    seance.description = data.get('description', seance.description)
    db.session.commit()
    return jsonify({
        'id': seance.id,
        'id_beacon': seance.id_beacon,
        'id_user': seance.id_user,
        'data_start': format_date(seance.data_start),
        'data_end': format_date(seance.data_end),
        'description': seance.description
    }), 200

@seance_bp.route('/seances/<int:id>', methods=['DELETE'])
@jwt_required()
def deactivate_seance(id):
    seance = Seance.query.get_or_404(id)
    seance.data_end = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Seance deactivated successfully'}), 200

@seance_bp.route('/current_seance', methods=['GET'])
@jwt_required()
def get_current_seance():
    current_user_id = get_jwt_identity()['id']
    current_time = datetime.utcnow()
    current_seance = Seance.query.filter(
        Seance.id_user == current_user_id,
        Seance.data_start <= current_time,
        Seance.data_end >= current_time
    ).first()
    
    if not current_seance:
        return jsonify({'error': 'No active seance found for the current user'}), 404

    return jsonify({
        'id': current_seance.id,
        'id_beacon': current_seance.id_beacon,
        'id_user': current_seance.id_user,
        'data_start': format_date(current_seance.data_start),
        'data_end': format_date(current_seance.data_end),
        'description': current_seance.description
    })
