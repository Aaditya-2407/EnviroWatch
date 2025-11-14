from flask import Blueprint, request, jsonify
from models.model_wrapper import model_wrapper

predict_bp = Blueprint("predict", __name__)

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
