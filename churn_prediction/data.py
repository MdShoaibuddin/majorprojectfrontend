"""Generate and load a small, offline telecom churn dataset."""

from pathlib import Path

import numpy as np
import pandas as pd


FEATURE_COLUMNS = [
    "SeniorCitizen",
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
    "Contract",
    "InternetService",
    "PaymentMethod",
    "PaperlessBilling",
    "TechSupport",
    "OnlineSecurity",
    "Dependents",
]
TARGET_COLUMN = "Churn"


def make_sample_data(rows: int = 1200, random_state: int = 42) -> pd.DataFrame:
    """Create realistic-shaped synthetic telecom records for demos and tests."""
    if rows < 20:
        raise ValueError("rows must be at least 20 to support a stratified split")

    rng = np.random.default_rng(random_state)
    tenure = rng.integers(0, 73, size=rows)
    monthly_charges = np.round(rng.uniform(25, 120, size=rows), 2)
    contracts = rng.choice(["Month-to-month", "One year", "Two year"], rows, p=[0.56, 0.24, 0.20])
    internet = rng.choice(["Fiber optic", "DSL", "No"], rows, p=[0.48, 0.36, 0.16])
    payment = rng.choice(
        ["Electronic check", "Mailed check", "Bank transfer", "Credit card"],
        rows,
        p=[0.35, 0.18, 0.24, 0.23],
    )
    senior = rng.binomial(1, 0.16, size=rows)
    paperless = rng.choice(["Yes", "No"], rows, p=[0.62, 0.38])
    tech_support = rng.choice(["Yes", "No", "No internet service"], rows, p=[0.28, 0.56, 0.16])
    online_security = rng.choice(["Yes", "No", "No internet service"], rows, p=[0.31, 0.53, 0.16])
    dependents = rng.choice(["Yes", "No"], rows, p=[0.30, 0.70])

    log_odds = (
        -0.45
        + (contracts == "Month-to-month") * 1.05
        - (contracts == "Two year") * 0.9
        + (tenure < 12) * 0.95
        - (tenure > 48) * 0.75
        + (internet == "Fiber optic") * 0.35
        + (payment == "Electronic check") * 0.4
        + (tech_support == "No") * 0.25
        + (online_security == "No") * 0.2
        + senior * 0.18
        - (dependents == "Yes") * 0.25
        + rng.normal(0, 0.35, size=rows)
    )
    churn_probability = 1 / (1 + np.exp(-log_odds))

    return pd.DataFrame(
        {
            "customerID": [f"C{number:05d}" for number in range(1, rows + 1)],
            "SeniorCitizen": senior,
            "tenure": tenure,
            "MonthlyCharges": monthly_charges,
            "TotalCharges": np.round(monthly_charges * tenure, 2),
            "Contract": contracts,
            "InternetService": internet,
            "PaymentMethod": payment,
            "PaperlessBilling": paperless,
            "TechSupport": tech_support,
            "OnlineSecurity": online_security,
            "Dependents": dependents,
            TARGET_COLUMN: rng.binomial(1, churn_probability),
        }
    )


def load_dataset(path: str | Path | None = None) -> pd.DataFrame:
    """Load a customer CSV or return generated sample data."""
    frame = make_sample_data() if path is None else pd.read_csv(path)
    missing = set(FEATURE_COLUMNS + [TARGET_COLUMN]) - set(frame.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(sorted(missing))}")

    labels = frame[TARGET_COLUMN]
    if not pd.api.types.is_numeric_dtype(labels.dtype):
        normalized = labels.astype(str).str.strip().str.lower().map(
            {"yes": 1, "no": 0, "true": 1, "false": 0, "1": 1, "0": 0}
        )
        if normalized.isna().any():
            raise ValueError("Churn values must be 0/1, Yes/No, or True/False")
        frame[TARGET_COLUMN] = normalized.astype(int)

    frame[TARGET_COLUMN] = frame[TARGET_COLUMN].astype(int)
    if set(frame[TARGET_COLUMN].unique()) != {0, 1}:
        raise ValueError("Churn must contain both classes (0 and 1)")
    return frame