def register_blueprints(app):
    from .beacon.routes import beacon_bp
    from .main_routes import main_bp
    from .seance.routes import seance_bp

    app.register_blueprint(beacon_bp, url_prefix='/api')
    app.register_blueprint(main_bp)
    app.register_blueprint(seance_bp, url_prefix='/api')