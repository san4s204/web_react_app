# beacon/routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from init import db
from models import Beacon

beacon_bp = Blueprint('beacon_bp', __name__)

@beacon_bp.route('/beacons', methods=['GET'])
@jwt_required()
def get_beacons():
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    beacons = Beacon.query.all()
    beacons_list = [{
        'id': beacon.id,
        'id_device': beacon.id_device,
        'id_mqtt': beacon.id_mqtt,
        'message': beacon.message
    } for beacon in beacons]
    return jsonify(beacons_list), 200

@beacon_bp.route('/beacons', methods=['POST'])
@jwt_required()
def add_beacon():
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    data = request.get_json()
    new_beacon = Beacon(id_device=data['id_device'], id_mqtt=data['id_mqtt'])
    db.session.add(new_beacon)
    db.session.commit()
    return jsonify({"message": "Beacon added successfully"}), 201

@beacon_bp.route('/beacons/<int:beacon_id>', methods=['GET'])
@jwt_required()
def get_beacon(beacon_id):
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    beacon = Beacon.query.get_or_404(beacon_id)
    return jsonify({
        'id': beacon.id,
        'id_device': beacon.id_device,
        'id_mqtt': beacon.id_mqtt
    }), 200

@beacon_bp.route('/beacons/<int:beacon_id>', methods=['PUT'])
@jwt_required()
def update_beacon(beacon_id):
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    data = request.get_json()
    beacon = Beacon.query.get_or_404(beacon_id)
    beacon.id_device = data.get('id_device', beacon.id_device)
    beacon.id_mqtt = data.get('id_mqtt', beacon.id_mqtt)
    db.session.commit()
    return jsonify({"message": "Beacon updated successfully"}), 200

@beacon_bp.route('/beacons/<int:beacon_id>', methods=['DELETE'])
@jwt_required()
def delete_beacon(beacon_id):
    identity = get_jwt_identity()
    if 'admin' not in identity['roles']:
        return jsonify(error='Access forbidden'), 403
    beacon = Beacon.query.get_or_404(beacon_id)
    db.session.delete(beacon)
    db.session.commit()
    return jsonify({"message": "Beacon deleted successfully"}), 200
