# utils/fetch_weather.py
import os, requests
from datetime import datetime, timezone
OW_KEY = os.getenv("OPENWEATHER_API_KEY")

def geocode_city(city):
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {"q": city, "limit": 1, "appid": OW_KEY}
    r = requests.get(url, params=params, timeout=8)
    r.raise_for_status()
    data = r.json()
    if not data: raise ValueError("City not found")
    return data[0]["lat"], data[0]["lon"]

def fetch_weather_for(dt_iso: str, lat: float, lon: float):
    """
    dt_iso: 'YYYY-MM-DDTHH:MM:SSZ' or similar. We will fetch hourly/day data and choose nearest.
    Returns JSON of hourly/current fields needed.
    """
    # using One Call 3.0 / 2.5 compatible endpoint, try hourly/current
    url = "https://api.openweathermap.org/data/2.5/onecall"
    params = {"lat": lat, "lon": lon, "exclude": "minutely", "appid": OW_KEY, "units": "metric"}
    r = requests.get(url, params=params, timeout=8)
    r.raise_for_status()
    return r.json()

