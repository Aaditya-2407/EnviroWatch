import os, joblib, pandas as pd

class ModelWrapper:
    def __init__(self, models_dir=None):
        self.models_dir = models_dir or os.path.join(os.getcwd(), "models")
        # try both .cbm and .pkl
        p_cbm = os.path.join(self.models_dir, "cat.cbm")
        p_pkl = os.path.join(self.models_dir, "cat.pkl")
        if os.path.exists(p_cbm):
            from catboost import CatBoostClassifier
            self.model = CatBoostClassifier()
            self.model.load_model(p_cbm)
        elif os.path.exists(p_pkl):
            self.model = joblib.load(p_pkl)
        else:
            raise FileNotFoundError(f"No model found (cat.cbm or cat.pkl) in {self.models_dir}")

        self.feature_names = getattr(self.model, "feature_names_", None)

    def predict_from_dict(self, d: dict):
        # convert to single-row DataFrame
        df = pd.DataFrame([d])
        # reorder columns to match training if feature_names present
        if self.feature_names:
            # ensure all required cols present
            missing = [c for c in self.feature_names if c not in df.columns]
            if missing:
                raise ValueError("Missing feature columns: " + ", ".join(missing))
            df = df[self.feature_names]
        # ensure string categories are strings
        for col in df.select_dtypes(include=["object"]).columns:
            df[col] = df[col].astype(str)

        pred = self.model.predict(df)
        proba = None
        if hasattr(self.model, "predict_proba"):
            try:
                proba = self.model.predict_proba(df).tolist()
            except Exception:
                proba = None

        # normalize outputs into JSON serializable types
        if hasattr(pred, "tolist"):
            pred_out = pred.tolist()
        else:
            pred_out = pred

        return {"ok": True, "prediction": pred_out, "probabilities": proba}
