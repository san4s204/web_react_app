from init import db, bcrypt


# Определение моделей данных


class Position(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    beacon_id = db.Column(db.Integer, db.ForeignKey('beacon.id'), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    data_recived = db.Column(db.DateTime, nullable=False)


class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role_name = db.Column(db.String(20), nullable=False, unique=True)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    roles = db.relationship('Role', secondary='user_role', backref='users')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class UserRole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    id_role = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)


class Beacon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_device = db.Column(db.String(100), nullable=False)
    id_mqtt = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(300), nullable=True)


class Seance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_beacon = db.Column(db.Integer, db.ForeignKey('beacon.id'), nullable=False)
    id_user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    data_start = db.Column(db.DateTime, nullable=False)
    data_end = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(100), nullable=True)
    

    beacon = db.relationship('Beacon', backref=db.backref('seances', lazy=True))
    user = db.relationship('User', backref=db.backref('seances', lazy=True))