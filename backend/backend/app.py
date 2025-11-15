# app.py
import os
from flask import Flask

# import blueprints (these modules should only create Blueprint objects,
# not attempt to register them or import `app`)
from api.health import health_bp
from api.predict import predict_bp

# create app
app = Flask(__name__)

# register blueprints under /api (only here)
app.register_blueprint(health_bp, url_prefix="/api")
app.register_blueprint(predict_bp, url_prefix="/api")

# optional: create and attach a ModelWrapper instance (fail gracefully)
try:
    from models.model_wrapper import ModelWrapper
    app.model_wrapper = ModelWrapper()
except Exception as e:
    print("ModelWrapper init failed:", e)
    app.model_wrapper = None

@app.route("/")
def index():
    return "Model API is running!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(debug=True, host="0.0.0.0", port=port)
