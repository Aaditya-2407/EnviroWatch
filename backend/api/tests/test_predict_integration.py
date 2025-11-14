# api/tests/test_predict_integration.py
import os
import pytest
from models.model_wrapper import ModelWrapper

def make_sample_payload():
    # minimal sample matching your pydantic schema; adjust values as needed
    return {
        "Location": "Sydney",
        "MinTemp": 15.0,
        "MaxTemp": 25.0,
        "Rainfall": 0.0,
        "Evaporation": 0.0,
        "Sunshine": 0.0,
        "WindGustDir": "N",
        "WindGustSpeed": 20.0,
        "WindDir9am": "N",
        "WindDir3pm": "NNW",
        "WindSpeed9am": 10.0,
        "WindSpeed3pm": 12.0,
        "Humidity9am": 60.0,
        "Humidity3pm": 50.0,
        "Pressure9am": 1018.0,
        "Pressure3pm": 1016.5,
        "Cloud9am": 2.0,
        "Cloud3pm": 1.0,
        "Temp9am": 14.0,
        "Temp3pm": 21.0,
        "RainToday": "No",
        "Date_month": 11,
        "Date_day": 14
    }

def test_predict_from_wrapper():
    wrapper = ModelWrapper()
    payload = make_sample_payload()
    res = wrapper.predict_from_dict(payload)
    assert isinstance(res, dict)
    assert res.get("ok") is True
    assert "prediction" in res
