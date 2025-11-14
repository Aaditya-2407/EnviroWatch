import os
import joblib
from catboost import CatBoostClassifier

class ModelWrapper:
    def __init__(self):
        base = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base, "models", "cat.pkl")

        self.model = joblib.load(model_path)

        # extract feature names
        try:
            self.feature_names = self.model.feature_names_
        except Exception:
            self.feature_names = None

    def predict(self, data: dict):
        """
        data: a dict of feature_name -> value
        """
        import pandas as pd

        df = pd.DataFrame([data])

        pred = self.model.predict(df)[0]
        prob = float(self.model.predict_proba(df)[0][1])

        return {
            "prediction": int(pred),
            "probability": prob
        }

# Singleton instance
model_wrapper = ModelWrapper()
