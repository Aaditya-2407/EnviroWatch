# models/model_wrapper.py
import os
import joblib
from typing import List, Optional

class ModelWrapper:
    """
    Loads a CatBoost model (cat.pkl) from models/ and provides:
      - predict_from_dict(d) -> {"ok": True, "prediction": ..., "probabilities": ...}
      - predict(df) -> raw model prediction array

    This wrapper attempts to discover categorical columns from the loaded
    CatBoost model metadata (feature_types_, feature_names_). If metadata
    isn't available it falls back to a safe default (no cat features)
    to avoid type-mismatch runtime errors while still allowing predictions.
    """

    DEFAULT_CAT_COLUMNS: List[str] = []  # empty by default: safer fallback

    def __init__(self, model_dir: Optional[str] = None):
        self.model_dir = model_dir or os.path.join(os.getcwd(), "models")
        cat_pkl = os.path.join(self.model_dir, "cat.pkl")
        if not os.path.exists(cat_pkl):
            raise FileNotFoundError(f"No model found at {cat_pkl}")

        # load model (joblib)
        self.catboost_model = joblib.load(cat_pkl)

        # Try to introspect model metadata
        names = getattr(self.catboost_model, "feature_names_", None) or getattr(self.catboost_model, "feature_names", None)
        ft = getattr(self.catboost_model, "feature_types_", None)

        if ft and names and len(ft) == len(names):
            # model-provided feature types may be "Float" or "Categorical" etc.
            self.categorical_columns = [n for n, t in zip(names, ft) if str(t).lower().startswith("cat")]
        else:
            # fallback: empty list (treat everything numeric) — safe to avoid CatBoost mismatch errors
            # If you want to use explicit columns, set DEFAULT_CAT_COLUMNS above or set `self.categorical_columns`
            self.categorical_columns = list(self.DEFAULT_CAT_COLUMNS)

        # If you know exact feature order used in training, optionally set self.feature_names here.
        # self.feature_names = names or [...]
        self.feature_names = list(names) if names else None

    def _ensure_columns(self, df):
        """
        Ensure expected columns exist in df (pandas.DataFrame).
        If feature_names are known, ensure they exist (fill with None).
        """
        if self.feature_names:
            for c in self.feature_names:
                if c not in df.columns:
                    df[c] = None
        return df

    def predict_from_dict(self, d: dict):
        import pandas as pd
        from catboost import Pool

        # single-row dataframe
        df = pd.DataFrame([d])

        # ensure expected columns exist (if known)
        df = self._ensure_columns(df)

        # ensure categorical columns exist and are string-typed if present
        for c in self.categorical_columns:
            if c not in df.columns:
                df[c] = None
            df[c] = df[c].fillna("MISSING").astype(str)

        # coerce numeric columns (everything else except known date parts)
        exclude = set(self.categorical_columns) | {"Date", "Date_month", "Date_day"}
        for col in [c for c in df.columns if c not in exclude]:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        # create Pool: pass cat_features only if not empty, else None
        cat_features = self.categorical_columns if self.categorical_columns else None
        pool = Pool(df, cat_features=cat_features)

        # predict
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
        Accepts a pandas.DataFrame (or convertible). Returns model prediction array.
        Ensures same coercion rules as predict_from_dict.
        """
        import pandas as pd
        from catboost import Pool

        if not isinstance(df, pd.DataFrame):
            df = pd.DataFrame(df)

        # ensure expected columns if known
        df = self._ensure_columns(df)

        # categorical columns string-typed
        for c in self.categorical_columns:
            if c in df.columns:
                df[c] = df[c].fillna("MISSING").astype(str)

        # coerce numeric columns
        exclude = set(self.categorical_columns) | {"Date", "Date_month", "Date_day"}
        for col in [c for c in df.columns if c not in exclude]:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        pool = Pool(df, cat_features=self.categorical_columns if self.categorical_columns else None)
        return self.catboost_model.predict(pool)
