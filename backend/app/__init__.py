from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import logging
from logging.handlers import RotatingFileHandler
import os

application = Flask(__name__)
CORS(application, supports_credentials=True, origins='https://portfolioghostdev.ru') 
application.config.from_object(Config)

db = SQLAlchemy(application)
migrate = Migrate(application, db)

if not application.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/backand.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter( '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
    file_handler.setLevel(logging.INFO)
    application.logger.addHandler(file_handler)

    application.logger.setLevel(logging.INFO)
    application.logger.info('Test task')

from app.api.handlers import api_bp
application.register_blueprint(api_bp)

from app.models import user_model, project_model


