# api/aqi_leaderboard.py
from flask import Blueprint, jsonify
from cachetools import TTLCache
from utils.fetch_aqi import fetch_latest_pollutants_for_city, aggregate_pollutants
from utils.aqi_calc import combined_aqi

cache = TTLCache(maxsize=1, ttl=300)  # 5-minute cache
bp = Blueprint("aqi_leaderboard", __name__)

CITIES = ["Delhi", "Mumbai", "Pune", "Bengaluru", "Hyderabad"]

def _refresh():
    board = []
    for c in CITIES:
        raw = fetch_latest_pollutants_for_city(c)
        agg = aggregate_pollutants(raw)
        agg["aqi"] = combined_aqi(agg.get("pm25"), agg.get("pm10"))
        board.append({"city": c, **agg})
    board = sorted(board, key=lambda x: (x.get("aqi") if x.get("aqi") is not None else 999), reverse=True)
    cache["board"] = board
    return board

@bp.route("/aqi/leaderboard", methods=["GET"])
def leaderboard():
    if "board" not in cache:
        _refresh()
    return jsonify({"ok": True, "leaderboard": cache["board"]})

