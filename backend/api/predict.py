from flask import Blueprint, request, jsonify
from models.model_wrapper import model_wrapper
# at top:
from models.schemas import PredictPayload
from pydantic import ValidationError

# inside predict route (replace current get_json logic)
try:
    payload = PredictPayload.parse_obj(data)  # will raise ValidationError on bad payload
except ValidationError as e:
    return jsonify({"ok": False, "error": "Invalid payload", "details": e.errors()}), 400

# then use payload.dict() to pass to your model wrapper
prediction_result = model.predict_from_dict(payload.dict())


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
