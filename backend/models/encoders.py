# models/encoders.py
import joblib
from typing import List, Dict
from sklearn.preprocessing import OrdinalEncoder, LabelEncoder
import os

ENCODER_DIR = "models/encoders"

def save_ord_encoder(X_column_values: list, out_path: str):
    """
    Fit an OrdinalEncoder on the column values and save.
    Example: save_ord_encoder(list_of_locations, "models/encoders/location_ord.pkl")
    """
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    enc = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
    # scikit OrdinalEncoder expects 2D
    enc.fit([[v] for v in X_column_values])
    joblib.dump(enc, out_path)

def load_encoder(path: str):
    return joblib.load(path)

def save_label_encoder(values: list, out_path: str):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    le = LabelEncoder()
    le.fit(values)
    joblib.dump(le, out_path)
