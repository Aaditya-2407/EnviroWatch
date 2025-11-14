from flask import Flask, request, jsonify
from models.model_wrapper import ModelWrapper
import traceback
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


app = Flask(__name__)
try:
    model = ModelWrapper()
except Exception as e:
    print("ModelWrapper init failed:", e)
    model = None

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"ok": False, "error": "Model failed to initialize"}), 500

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"ok": False, "error": "No JSON payload received"}), 400

    # Log incoming payload to console to verify keys/types
    print("INCOMING JSON:", data)

    # Try to use wrapper if exists
    try:
        # if your wrapper has predict_from_dict, call it
        if hasattr(model, "predict_from_dict"):
            res = model.predict_from_dict(data)
            print("Wrapper result:", res)
            return jsonify(res), 200
        # else, do a direct DataFrame predict attempt
        import pandas as pd
        df = pd.DataFrame([data])
        pred = getattr(model, "predict", lambda x: None)(df)
        proba = None
        if hasattr(model, "predict_proba"):
            try:
                proba = model.predict_proba(df).tolist()
            except Exception as e:
                print("predict_proba failed:", e)
        out = {"ok": True, "prediction": pred.tolist() if hasattr(pred, "tolist") else pred, "probabilities": proba}
        print("Direct predict result:", out)
        return jsonify(out), 200
    except FileNotFoundError as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": f"Internal server error: {e}"}), 500
