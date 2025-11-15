# utils/feature_mapper.py
from datetime import datetime
def map_to_model_features(weather_json, aqi_dict, city, date_str, time_str):
    """
    Return a dict matching your PredictPayload/ModelWrapper.feature_names.
    You must extract or compute the 23 features: Location, MinTemp, MaxTemp, Rainfall, Evaporation, Sunshine,
    WindGustDir, WindGustSpeed, WindDir9am, WindDir3pm, WindSpeed9am, WindSpeed3pm, Humidity9am, Humidity3pm,
    Pressure9am, Pressure3pm, Cloud9am, Cloud3pm, Temp9am, Temp3pm, RainToday, Date_month, Date_day
    Use weather_json to fill nearest hourly values; fallback to daily.
    """
    # Implementations will vary — simple approach:
    # - pick hourly datapoints near 09:00 and 15:00 of requested date
    # - fill missing with day averages / 0
    # Return a dict.
    features = {}
    # minimal stub — **you must expand** to use weather fields properly
    features["Location"] = city
    features["Date_month"] = int(date_str.split("-")[1])
    features["Date_day"] = int(date_str.split("-")[2])
    # set numeric defaults or pick from weather_json
    features["MinTemp"] = weather_json.get("daily", [{}])[0].get("temp", {}).get("min", 0.0)
    features["MaxTemp"] = weather_json.get("daily", [{}])[0].get("temp", {}).get("max", 0.0)
    features["Rainfall"] = weather_json.get("daily", [{}])[0].get("rain", 0.0) or 0.0
    features["Evaporation"] = 0.0
    features["Sunshine"] = 0.0
    # wind placeholders
    features["WindGustDir"] = "MISSING"
    features["WindGustSpeed"] = 0.0
    for name in ["WindDir9am","WindDir3pm","WindSpeed9am","WindSpeed3pm","Humidity9am","Humidity3pm",
                 "Pressure9am","Pressure3pm","Cloud9am","Cloud3pm","Temp9am","Temp3pm","RainToday"]:
        features[name] = 0 if "Temp" not in name and "Dir" not in name and "Rain" not in name else ("No" if "Rain" in name else 0)
    # This is a skeleton — replace with actual mapping using hourly data
    return features

