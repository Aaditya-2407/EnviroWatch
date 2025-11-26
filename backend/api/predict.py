from flask import Blueprint, request, jsonify
from models.model_wrapper import model_wrapper
from models.schemas import PredictPayload
from pydantic import ValidationError
import traceback

predict_bp = Blueprint("predict", __name__)

def _sanitize_for_json(obj):
    if isinstance(obj, Exception):
        return str(obj)
    
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    
    if isinstance(obj, list):
        return [_sanitize_for_json(x) for x in obj]
    
    return obj

@predict_bp.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.json
        
        if not payload:
            return jsonify({"error": "No JSON received"}), 400
        
        result = model_wrapper.predict(payload)
        return jsonify(result)
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500
