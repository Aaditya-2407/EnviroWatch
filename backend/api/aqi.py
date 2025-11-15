# api/aqi.py
from flask import Blueprint, request, jsonify
from utils.fetch_aqi import fetch_latest_pollutants_for_city, aggregate_pollutants
from utils.aqi_calc import combined_aqi
bp = Blueprint("aqi", __name__)

@bp.route("/aqi", methods=["GET"])
def get_aqi():
    city = request.args.get("city")
    if not city:
        return jsonify({"ok": False, "error": "city required"}), 400
    raw = fetch_latest_pollutants_for_city(city)
    agg = aggregate_pollutants(raw)
    agg["aqi"] = combined_aqi(agg.get("pm25"), agg.get("pm10"))
    return jsonify({"ok": True, "city": city, "data": agg}), 200
