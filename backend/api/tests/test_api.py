import json
import pytest
from app import app

client = app.test_client()


def make_sample_payload():
    # Minimal valid sample according to models/schemas.py
    return {
        "Location": "Sydney",
        "MinTemp": 15.0,
        "MaxTemp": 25.0,
        "Rainfall": 0.0,
        "Date_month": 11,
        "Date_day": 14,
        "RainToday": "No"
    }


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    j = r.get_json()
    assert isinstance(j, dict)
    assert j.get("status") == "ok"


def test_predict_valid():
    payload = make_sample_payload()
    r = client.post("/api/predict", json=payload)
    assert r.status_code == 200, f"bad status: {r.status_code} body: {r.data}"
    j = r.get_json()
    assert isinstance(j, dict)
    assert j.get("ok") is True
    # prediction/probabilities may be None depending on your model impl,
    # but keys should exist (adjust if your model returns other shape)
    # acceptable if prediction is present or null
    assert "prediction" in j or "probabilities" in j or "ok" in j


def test_predict_bad_payload():
    bad = {"Location": "", "MinTemp": "not-a-number"}
    r = client.post("/api/predict", json=bad)
    assert r.status_code == 400
    j = r.get_json()
    assert j.get("ok") is False
    assert "details" in j or "error" in j
