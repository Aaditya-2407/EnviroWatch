# api/visualize.py
from flask import Blueprint, request, jsonify
from utils.fetch_weather import geocode_city, fetch_weather_for
from utils.fetch_aqi import fetch_latest_pollutants_for_city, aggregate_pollutants
bp = Blueprint("visualize", __name__)

@bp.route("/visualize", methods=["GET"])
def visualize():
    city = request.args.get("city")
    if not city:
        return jsonify({"ok": False, "error": "city required"}), 400
    lat, lon = geocode_city(city)
    weather = fetch_weather_for(None, lat, lon)  # fetch 7-day daily
    # build minimal timeseries
    daily = weather.get("daily", [])
    timeseries = []
    for d in daily[:7]:
        timeseries.append({
            "dt": d.get("dt"),
            "temp_min": d.get("temp", {}).get("min"),
            "temp_max": d.get("temp", {}).get("max"),
            "rain": d.get("rain", 0.0)
        })
    return jsonify({"ok": True, "timeseries": timeseries}), 200
