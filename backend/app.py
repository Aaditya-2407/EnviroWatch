import os
from flask import Flask, request, jsonify
from models.model_wrapper import ModelWrapper


# Initialize the Flask application
app = Flask(__name__)

# Initialize the model wrapper
# This will load the model on the first request (lazy loading)
# Assumes a 'models' folder exists at the same level as app.py
try:
    model = ModelWrapper()
except Exception as e:
    print(f"Failed to initialize ModelWrapper: {e}")
    # You might want to handle this more gracefully
    model = None

@app.route("/")
def index():
    """A simple health check endpoint."""
    return "Model API is running!"

@app.route("/predict", methods=["POST"])
def predict():
    """
    The main prediction endpoint.
    Expects JSON data with features.
    """
    if model is None:
        return jsonify({"ok": False, "error": "Model failed to initialize"}), 500

    # Get the JSON data from the request
    try:
        data = request.get_json()
        if data is None:
            raise ValueError("No JSON payload received.")
    except Exception as e:
        return jsonify({"ok": False, "error": f"Bad request: {e}"}), 400

    # Use the wrapper to get a prediction
    try:
        prediction_result = model.predict_from_dict(data)
        return jsonify(prediction_result)
        
    except FileNotFoundError as e:
        # Specific error if model files are missing
        return jsonify({"ok": False, "error": str(e)}), 500
    except Exception as e:
        # Generic server error for other issues
        return jsonify({"ok": False, "error": f"Internal server error: {e}"}), 500

if __name__ == "__main__":
    # This allows running the app directly with 'python app.py'
    # The 'flask run' command in your script will use this block.
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)