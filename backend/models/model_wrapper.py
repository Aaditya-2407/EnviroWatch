# models/model_wrapper.py
import os
import joblib
import json
from typing import List, Optional
import pandas as pd

# runtime import for CatBoost only if available
try:
    from catboost import CatBoostClassifier, Pool
    _HAS_CATBOOST = True
except Exception:
    CatBoostClassifier = None
    Pool = None
    _HAS_CATBOOST = False


class ModelWrapper:
    """
    Lightweight wrapper that supports:
      - native CatBoost model files (cbm / cbm-like) loaded via CatBoostClassifier().load_model
      - joblib-dumped model objects (CatBoostClassifier or sklearn estimators)
    Usage:
      w = ModelWrapper("models/cat.cbm")
      preds = w.predict(X_df)         # returns numpy-like output (predict_proba if available)
    """

    def __init__(self, model_path: str = "models/cat.cbm", cat_features: Optional[List[str]] = None):
        self.model_path = model_path
        self.model = None                # if joblib-loaded or sklearn model
        self._cb_model = None            # if native CatBoostClassifier loaded via load_model
        self.feature_order: Optional[List[str]] = None
        self.cat_features: List[str] = cat_features or ["Location", "WindGustDir", "WindDir9am", "WindDir3pm", "RainToday"]
        self._load()

    def _load(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"No model found at {self.model_path}")

        # determine extension & try to load appropriate format
        _, ext = os.path.splitext(self.model_path.lower())

        # If CatBoost present and user provided a native cbm/catboost file, try load_model path
        if _HAS_CATBOOST and ext in (".cbm", ".bin", ".cbm2", ".model", ".cbm.txt", ".cbm.gz", ".cbm.bz2"):
            try:
                cb = CatBoostClassifier()
                cb.load_model(self.model_path)
                self._cb_model = cb
                # try to extract feature names if present
                self.feature_order = getattr(cb, "feature_names_", None) or getattr(cb, "feature_names", None)
                if self.feature_order is not None and isinstance(self.feature_order, (list, tuple)):
                    self.feature_order = list(self.feature_order)
                return
            except Exception as e:
                # fallthrough to joblib attempt if load_model fails
                pass

        # try joblib load (some of your training scripts saved with joblib.dump)
        try:
            obj = joblib.load(self.model_path)
            # if it's a CatBoostClassifier object after joblib load
            if _HAS_CATBOOST and isinstance(obj, CatBoostClassifier):
                self._cb_model = obj
                self.feature_order = getattr(obj, "feature_names_", None) or getattr(obj, "feature_names", None)
            else:
                # store generic model (sklearn-like)
                self.model = obj
                # try to introspect feature names attribute (if any)
                self.feature_order = getattr(obj, "feature_names_in_", None) or getattr(obj, "feature_names_", None)
                if self.feature_order is not None:
                    self.feature_order = list(self.feature_order)
            return
        except Exception as e:
            raise RuntimeError(f"Failed to load model from {self.model_path}: {e}")

    def _prepare_dataframe(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Ensure the DataFrame columns match the model's expected order if known,
        and coerce categorical columns to dtype 'category' for CatBoost.
        """
        if not isinstance(X, pd.DataFrame):
            raise ValueError("X must be a pandas DataFrame")

        # reorder to feature_order if available (fill missing columns with default 0 or empty)
        if self.feature_order:
            row = {}
            for c in self.feature_order:
                if c in X.columns:
                    row[c] = X[c]
                else:
                    # default fill: empty string for categorical names, 0 for numeric
                    if c in self.cat_features:
                        row[c] = pd.Series(["MISSING"] * len(X), index=X.index)
                    else:
                        row[c] = pd.Series([0.0] * len(X), index=X.index)
            X2 = pd.DataFrame(row)
        else:
            # deterministic columns: sort
            cols = sorted(X.columns.tolist())
            X2 = X[cols].copy()

        # coerce categorical columns
        for c in self.cat_features:
            if c in X2.columns:
                # convert to string first then category to avoid pandas warnings
                X2[c] = X2[c].astype(str).fillna("MISSING")
                try:
                    X2[c] = X2[c].astype("category")
                except Exception:
                    # final fallback: keep as object (CatBoost may still accept)
                    X2[c] = X2[c].astype(object)
        # ensure numeric columns are numeric
        for c in X2.columns:
            if c not in self.cat_features:
                X2[c] = pd.to_numeric(X2[c], errors="coerce").fillna(0.0)

        return X2

    def predict(self, X: pd.DataFrame):
        """
        Returns model output:
          - If CatBoost available and model is CatBoost, returns predict_proba (ndarray) if available,
            else predict (labels).
          - If generic sklearn-like model, will call predict_proba if exists else predict.
        """
        if not isinstance(X, pd.DataFrame):
            # if dict-like, convert
            if isinstance(X, dict):
                X = pd.DataFrame([X])
            else:
                raise ValueError("predict expects a pandas DataFrame or dict")

        Xp = self._prepare_dataframe(X)

        # If we have a native CatBoost model object
        if self._cb_model is not None:
            try:
                # build Pool with categorical feature names/indices if possible
                if Pool is not None:
                    # catboost accepts either names or indices; supply indices if feature_order known
                    cat_idx = []
                    if self.feature_order:
                        for c in self.cat_features:
                            if c in self.feature_order:
                                cat_idx.append(self.feature_order.index(c))
                    else:
                        for c in self.cat_features:
                            if c in Xp.columns:
                                cat_idx.append(Xp.columns.get_loc(c))
                    pool = Pool(Xp, cat_features=cat_idx or None)
                    # prefer predict_proba if available
                    if hasattr(self._cb_model, "predict_proba"):
                        return self._cb_model.predict_proba(pool)
                    else:
                        return self._cb_model.predict(pool)
                else:
                    # Pool not available - try direct predict on dataframe
                    if hasattr(self._cb_model, "predict_proba"):
                        return self._cb_model.predict_proba(Xp)
                    else:
                        return self._cb_model.predict(Xp)
            except Exception as e:
                raise RuntimeError(f"CatBoost predict error: {e}")

        # If we have a generic sklearn-like model
        if self.model is not None:
            try:
                if hasattr(self.model, "predict_proba"):
                    return self.model.predict_proba(Xp)
                return self.model.predict(Xp)
            except Exception as e:
                raise RuntimeError(f"Model predict error: {e}")

        raise RuntimeError("No loaded model available")

    # convenience: expose some useful attrs for upstream code
    @property
    def feature_names_(self):
        return self.feature_order

    def to_metadata(self):
        return {
            "model_path": self.model_path,
            "feature_order": self.feature_order,
            "cat_features": self.cat_features,
            "has_catboost": _HAS_CATBOOST
        }
