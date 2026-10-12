"""Model training, evaluation, persistence, and scoring."""

from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from churn_prediction.data import FEATURE_COLUMNS, TARGET_COLUMN


NUMERIC_COLUMNS = ["SeniorCitizen", "tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_COLUMNS = [column for column in FEATURE_COLUMNS if column not in NUMERIC_COLUMNS]


def build_model() -> Pipeline:
    """Build a preprocessing and class-weighted logistic regression pipeline."""
    numeric = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ]
    )
    preprocessing = ColumnTransformer(
        [
            ("numeric", numeric, NUMERIC_COLUMNS),
            ("categorical", categorical, CATEGORICAL_COLUMNS),
        ]
    )
    return Pipeline(
        [
            ("preprocessing", preprocessing),
            ("classifier", LogisticRegression(class_weight="balanced", max_iter=1000)),
        ]
    )


def train_model(
    frame: pd.DataFrame, test_size: float = 0.25, random_state: int = 42
) -> tuple[Pipeline, dict[str, Any]]:
    """Fit the model and return holdout metrics, including a confusion matrix."""
    missing = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(frame.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(sorted(missing))}")

    features = frame[FEATURE_COLUMNS]
    target = frame[TARGET_COLUMN].astype(int)
    x_train, x_test, y_train, y_test = train_test_split(
        features, target, test_size=test_size, random_state=random_state, stratify=target
    )
    model = build_model()
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    probabilities = model.predict_proba(x_test)[:, 1]
    metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision_score(y_test, predictions, zero_division=0)),
        "recall": float(recall_score(y_test, predictions, zero_division=0)),
        "f1": float(f1_score(y_test, predictions, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, probabilities)),
        "confusion_matrix": confusion_matrix(y_test, predictions, labels=[0, 1]).tolist(),
        "test_rows": int(len(y_test)),
    }
    return model, metrics


def save_model(model: Pipeline, path: str | Path) -> None:
    """Persist a trained pipeline, creating its destination directory as needed."""
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, destination)


def load_model(path: str | Path) -> Pipeline:
    """Load a pipeline previously written by :func:`save_model`."""
    return joblib.load(path)


def predict_churn(model: Pipeline, customers: pd.DataFrame) -> pd.DataFrame:
    """Return each customer's churn label and estimated churn probability."""
    missing = set(FEATURE_COLUMNS) - set(customers.columns)
    if missing:
        raise ValueError(f"Customer data is missing required columns: {', '.join(sorted(missing))}")
    features = customers[FEATURE_COLUMNS]
    result = customers.copy()
    result["churn_probability"] = model.predict_proba(features)[:, 1]
    result["predicted_churn"] = model.predict(features).astype(int)
    return result