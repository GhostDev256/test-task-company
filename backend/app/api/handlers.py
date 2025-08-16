from app.api.forms import *
from app.models.user_model import User
from flask import jsonify, request
from . import api_bp

@api_bp.route('/ping', methods=['GET'])
def get_user():
    return 'Я живой!'

