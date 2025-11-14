import os
from flask import Flask, request, jsonify
from models.model_wrapper import ModelWrapper
from api.health import health_bp

# Initialize the Flask application
app = Flask(__name__)

# register the health blueprint under /api
app.register_blueprint(health_bp, url_prefix="/api")

# Initialize the model wrapper (lazy or eager)
try:
    model = ModelWrapper()
except Exception as e:
    print(f"Failed to initialize ModelWrapper: {e}")
    model = None

@app.route("/")
def index():
    return "Model API is running!"

# make predict an API route under /api/predict
@app.route("/api/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"ok": False, "error": "Model failed to initialize"}), 500

    try:
        data = request.get_json()
        if data is None:
            raise ValueError("No JSON payload received.")
    except Exception as e:
        return jsonify({"ok": False, "error": f"Bad request: {e}"}), 400

    try:
        prediction_result = model.predict_from_dict(data)
        return jsonify(prediction_result)
    except FileNotFoundError as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        return jsonify({"ok": False, "error": f"Internal server error: {e}"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="127.0.0.1", port=port)
