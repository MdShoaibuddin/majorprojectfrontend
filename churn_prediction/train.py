"""Train and save a churn model from a CSV or generated sample data."""

import argparse
import json
from pathlib import Path

from churn_prediction.data import load_dataset
from churn_prediction.model import save_model, train_model


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", help="CSV path; omit to use generated sample data")
    parser.add_argument("--model", default="models/churn_model.joblib", help="Output model path")
    args = parser.parse_args()

    model, metrics = train_model(load_dataset(args.data))
    save_model(model, args.model)
    Path("reports").mkdir(exist_ok=True)
    Path("reports/metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    print(f"\nModel saved to {args.model}")


if __name__ == "__main__":
    main()