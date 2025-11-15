# utils/fetch_aqi.py
import requests, datetime

OPENAQ_BASE = "https://api.openaq.org/v2"

def fetch_latest_pollutants_for_city(city, limit=100):
    # OpenAQ: /v2/measurements?city=CityName
    params = {"city": city, "limit": limit, "sort": "desc", "order_by": "date"}
    r = requests.get(OPENAQ_BASE + "/measurements", params=params, timeout=8)
    r.raise_for_status()
    return r.json()

def aggregate_pollutants(measurements_json):
    # return a dict with pm25, pm10, no2, o3, so2, co (concentration or None)
    vals = {}
    # loop and pick most recent value per pollutant
    for m in measurements_json.get("results", []):
        p = m.get("parameter")
        if p not in vals:
            vals[p] = m.get("value")
    # map to standard names
    return {
        "pm25": vals.get("pm25"),
        "pm10": vals.get("pm10"),
        "no2": vals.get("no2"),
        "so2": vals.get("so2"),
        "co": vals.get("co"),
        "o3": vals.get("o3"),
        "source": "openaq"
    }
