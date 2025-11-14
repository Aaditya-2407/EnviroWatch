# models/model_wrapper.py
import os
import joblib

class ModelWrapper:
    def __init__(self, model_dir=None):
        """
        Load CatBoost model and discover which features are categorical.
        """
        # model directory (defaults to backend/models)
        self.model_dir = model_dir or os.path.join(os.getcwd(), "models")
        cat_pkl = os.path.join(self.model_dir, "cat.pkl")
        if not os.path.exists(cat_pkl):
            raise FileNotFoundError(f"No model found at {cat_pkl}")

        # load the model
        self.catboost_model = joblib.load(cat_pkl)

        # try to introspect model feature names / types
        names = getattr(self.catboost_model, "feature_names_", None) or getattr(self.catboost_model, "feature_names", None)
        ft = getattr(self.catboost_model, "feature_types_", None)

        if ft and names and len(ft) == len(names):
            # feature_types_ entries might be like "Categorical" or "Cat" or "Float"
            self.categorical_columns = [n for n, t in zip(names, ft) if str(t).lower().startswith("cat")]
            print("Detected categorical columns from model metadata:", self.categorical_columns)
        else:
            # fall back to reasonable manual list (remove Location if model expects float)
            # NOTE: adjust this list to match real training if needed
            # fallback categorical list (adjust until no mismatch errors)
            # If model metadata doesn't tell us types, treat all features as numeric
# (avoid CatBoost mismatch errors). Update later if you know true categoricals.
            self.categorical_columns = []
            print("Using empty categorical_columns: treating all features as numeric")

            print("Using fallback categorical_columns:", self.categorical_columns)

        # feature order used when training (adjust if your model used different order)
        self.feature_names = [
            "Location","MinTemp","MaxTemp","Rainfall","Evaporation","Sunshine",
            "WindGustDir","WindGustSpeed","WindDir9am","WindDir3pm",
            "WindSpeed9am","WindSpeed3pm","Humidity9am","Humidity3pm",
            "Pressure9am","Pressure3pm","Cloud9am","Cloud3pm","Temp9am","Temp3pm",
            "RainToday","Date_month","Date_day"
        ]

        # Debug prints for troubleshooting (remove later)
        try:
            print("Loaded model. feature_names_:", getattr(self.catboost_model, "feature_names_", None))
            print("Loaded model. feature_types_:", getattr(self.catboost_model, "feature_types_", None))
        except Exception:
            print("Loaded model. (no feature_names_/feature_types_ attrs)")

    def predict_from_dict(self, d):
        """
        Accepts a dict of feature_name: value and returns a JSON-serializable dict:
            {"ok": True, "prediction": ..., "probabilities": ...}
        """
        import pandas as pd
        from catboost import Pool

        # Build single-row DataFrame
        df = pd.DataFrame([d])

        # Ensure expected features exist (fill missing with None)
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = None

        # Ensure categorical columns exist
        for col in self.categorical_columns:
            if col not in df.columns:
                df[col] = None

        # Convert categorical columns to strings (consistent)
        for c in self.categorical_columns:
            df[c] = df[c].fillna("MISSING").astype(str)

        # Numeric columns = everything else except date fields
        exclude = set(self.categorical_columns) | {"Date", "Date_month", "Date_day"}
        numeric_cols = [c for c in df.columns if c not in exclude]
        for nc in numeric_cols:
            df[nc] = pd.to_numeric(df[nc], errors='coerce').fillna(0.0)

        # Debug
        print("DEBUG df for pool:", df.to_dict(orient="records"))
        print("DEBUG cat_features passed to Pool:", self.categorical_columns)

        # Create Pool with categorical features specified (or None)
        cat_features = self.categorical_columns if self.categorical_columns else None
        pool = Pool(df, cat_features=cat_features)

        # Predict
        pred = self.catboost_model.predict(pool)
        proba = None
        if hasattr(self.catboost_model, "predict_proba"):
            try:
                proba = self.catboost_model.predict_proba(pool).tolist()
            except Exception:
                proba = None

        pred_out = pred.tolist() if hasattr(pred, "tolist") else pred
        return {"ok": True, "prediction": pred_out, "probabilities": proba}

    def predict(self, df):
        """
        Convenience: accepts pandas.DataFrame and returns raw model prediction(s).
        Ensures types are coerced similarly to predict_from_dict.
        """
        from catboost import Pool
        import pandas as pd

        # ensure a DataFrame
        if not isinstance(df, (pd.DataFrame,)):
            df = pd.DataFrame(df)

        # Ensure categorical columns present & string-typed
        for c in self.categorical_columns:
            if c in df.columns:
                df[c] = df[c].fillna("MISSING").astype(str)

        # Coerce numeric columns (exclude categorical & date)
        exclude = set(self.categorical_columns) | {"Date", "Date_month", "Date_day"}
        for nc in [c for c in df.columns if c not in exclude]:
            df[nc] = pd.to_numeric(df[nc], errors='coerce').fillna(0.0)

        pool = Pool(df, cat_features=self.categorical_columns if self.categorical_columns else None)
        return self.catboost_model.predict(pool)
