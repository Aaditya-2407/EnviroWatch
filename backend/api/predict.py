# api/predict.py
from flask import Blueprint, request, jsonify, current_app
from models.schemas import PredictPayload
from pydantic import ValidationError
import traceback

predict_bp = Blueprint("predict", __name__)

def _sanitize_for_json(obj):
    """Recursively convert non-serializable objects to safe JSON (strings for exceptions/value errors)."""
    if isinstance(obj, Exception):
        return str(obj)
    if isinstance(obj, dict):
        return {k: _sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_for_json(x) for x in obj]
    return obj

@predict_bp.route("/predict", methods=["POST"])
def predict():
    payload_raw = request.get_json(silent=True)
    if payload_raw is None:
        return jsonify({"ok": False, "error": "No JSON received"}), 400

    try:
        # pydantic v2 style
        payload = PredictPayload.model_validate(payload_raw)
    except ValidationError as e:
        details = _sanitize_for_json(e.errors() if hasattr(e, "errors") else str(e))
        return jsonify({"ok": False, "error": "Invalid payload", "details": details}), 400

    # Get wrapper: prefer the app-level wrapper if present; if not, instantiate lazily
    try:
        wrapper = getattr(current_app, "model_wrapper", None)
        if wrapper is None:
            # lazy create (useful for tests that don't preload model)
            from models.model_wrapper import ModelWrapper
            wrapper = ModelWrapper()
    except FileNotFoundError as e:
        # missing model file — surface 500 with a clear message
        return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": f"Model init error: {e}"}), 500

    try:
        data_dict = payload.model_dump() if hasattr(payload, "model_dump") else payload.dict()
        # prefer wrapper.predict_from_dict if available
        if hasattr(wrapper, "predict_from_dict"):
            res = wrapper.predict_from_dict(data_dict)
            return jsonify(res), 200

        # fallback: call wrapper.predict on a DataFrame
        import pandas as pd
        df = pd.DataFrame([data_dict])
        pred = wrapper.predict(df)
        proba = wrapper.predict_proba(df).tolist() if hasattr(wrapper, "predict_proba") else None
        return jsonify({"ok": True, "prediction": pred.tolist() if hasattr(pred, "tolist") else pred, "probabilities": proba}), 200

    except FileNotFoundError as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        # sanitize exception to simple string
        return jsonify({"ok": False, "error": f"Internal server error: {str(e)}"}), 500
