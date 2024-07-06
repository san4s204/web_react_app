from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, create_refresh_token, get_jwt_identity
from init import db
from models import Position, User, Role, UserRole, Seance, Beacon
from datetime import datetime, timezone

main_bp = Blueprint('main_bp', __name__)

@main_bp.route('/positions', methods=['GET'])
@jwt_required()
def get_positions():
    try:
        user_info = get_jwt_identity()
        current_user_id = user_info['id']
        user_roles = user_info['roles']
    except Exception as e:
        return jsonify({'error': 'Invalid or missing token'}), 401

    start = request.args.get('start')
    end = request.args.get('end')
    seance_id = request.args.get('seanceId')

    query = Position.query.join(Beacon)

    if 'admin' in user_roles:
        # Если пользователь админ, получаем все позиции от всех маяков
        if seance_id:
            # Фильтруем позиции по id_beacon, привязанному к seance_id
            beacon_ids = db.session.query(Seance.id_beacon).filter(Seance.id == seance_id).subquery()
            query = query.filter(Position.beacon_id.in_(beacon_ids))
        if start:
            query = query.filter(Position.data_recived >= start)
        if end:
            query = query.filter(Position.data_recived <= end)
    else:
        # Для обычных пользователей проверяем текущий сеанс
        current_time = datetime.now(timezone.utc)
        current_time_str = current_time.strftime("%Y-%m-%dT%H:%M")
        current_seance = Seance.query.filter(
            Seance.id_user == current_user_id,
            Seance.data_start <= current_time_str,
            Seance.data_end >= current_time_str
        ).first()

        if not current_seance:
            return jsonify({'error': 'No active seance found for the current user'}), 404

        query = query.filter(Beacon.id == current_seance.id_beacon)
        if start:
            query = query.filter(Position.data_recived >= start)
        if end:
            query = query.filter(Position.data_recived <= end)

    positions = query.all()
    result = [{
        "id": position.id,
        "beacon_id": position.beacon_id,
        "lat": position.lat,
        "lng": position.lng,
        "data_recived": position.data_recived
    } for position in positions]

    return jsonify(result)


@main_bp.route('/latest_positions', methods=['GET'])
@jwt_required()
def get_latest_positions():
    try:
        user_info = get_jwt_identity()
        user_roles = user_info['roles']
    except Exception as e:
        return jsonify({'error': 'Invalid or missing token'}), 401

    if 'admin' not in user_roles:
        return jsonify({'error': 'Access forbidden'}), 403

    subquery = (
        db.session.query(
            Position.beacon_id,
            db.func.max(Position.data_recived).label('max_data_recived')
        ).group_by(Position.beacon_id).subquery()
    )

    query = db.session.query(Position).join(
        subquery,
        db.and_(
            Position.beacon_id == subquery.c.beacon_id,
            Position.data_recived == subquery.c.max_data_recived
        )
    )

    positions = query.all()

    result = [{
        "id": position.id,
        "beacon_id": position.beacon_id,
        "lat": position.lat,
        "lng": position.lng,
        "data_recived": position.data_recived
    } for position in positions]

    return jsonify(result)

@main_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'error': 'User already exists'}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

     # Назначение роли 'user' по умолчанию
    user_role = Role.query.filter_by(role_name='user').first()
    if user_role:
        new_user_role = UserRole(id_user=new_user.id, id_role=user_role.id)
        db.session.add(new_user_role)
        db.session.commit()
    else:
        return jsonify({"error": "Default role 'user' not found"}), 400

    return jsonify({"message": "User registered successfully"}), 201

@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    
    if user is None or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity={'id': user.id, 'username': username, 'roles': [role.role_name for role in user.roles]})
    refresh_token = create_refresh_token(identity={'id': user.id, 'username': username, 'roles': [role.role_name for role in user.roles]})
    return jsonify({'access_token': access_token, 'id': user.id, 'username': username, 'refresh_token': refresh_token, 'roles': [role.role_name for role in user.roles]}), 200

@main_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

@main_bp.route('/admin', methods=['GET'])
@jwt_required()
def admin():
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    return jsonify(message='Welcome to the admin page'), 200

@main_bp.route('/users', methods=['GET'])
# @jwt_required()
def get_users():
    users = User.query.all()
    users_list = [{
        'id': user.id,
        'username': user.username
    } for user in users]
    return jsonify(users_list)
