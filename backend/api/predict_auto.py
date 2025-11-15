# api/predict_auto.py
from flask import Blueprint, request, jsonify, current_app
from utils.fetch_weather import geocode_city, fetch_weather_for
from utils.fetch_aqi import fetch_latest_pollutants_for_city, aggregate_pollutants
from utils.aqi_calc import combined_aqi
from utils.feature_mapper import map_to_model_features
import traceback

bp = Blueprint("predict_auto", __name__)

@bp.route("/predict-auto", methods=["POST"])
def predict_auto():
    body = request.get_json(silent=True) or {}
    city = body.get("city")
    date = body.get("date")  # YYYY-MM-DD
    time = body.get("time")  # HH:MM

    if not city or not date or not time:
        return jsonify({"ok": False, "error": "city, date, time required"}), 400

    try:
        lat, lon = geocode_city(city)
        weather = fetch_weather_for(f"{date}T{time}Z", lat, lon)
        aqi_raw = fetch_latest_pollutants_for_city(city)
        aqi_agg = aggregate_pollutants(aqi_raw)
        aqi_val = combined_aqi(aqi_agg.get("pm25"), aqi_agg.get("pm10"))
        aqi_agg["aqi"] = aqi_val

        features = map_to_model_features(weather, aqi_agg, city, date, time)
        # call model
        wrapper = getattr(current_app, "model_wrapper", None)
        if wrapper is None:
            from models.model_wrapper import ModelWrapper
            wrapper = ModelWrapper()

        if hasattr(wrapper, "predict_from_dict"):
            res = wrapper.predict_from_dict(features)
            res["_meta"] = {"features_used": features, "aqi": aqi_agg}
            return jsonify(res), 200
        else:
            return jsonify({"ok": False, "error": "wrapper missing predict_from_dict"}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500
