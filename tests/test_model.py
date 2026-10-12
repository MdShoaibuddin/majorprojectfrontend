import pandas as pd

from churn_prediction.data import FEATURE_COLUMNS, load_dataset, make_sample_data
from churn_prediction.model import load_model, predict_churn, save_model, train_model


def test_sample_data_is_reproducible_and_usable():
    first = make_sample_data(rows=300, random_state=7)
    second = make_sample_data(rows=300, random_state=7)
    pd.testing.assert_frame_equal(first, second)
    loaded = load_dataset()
    assert set(loaded["Churn"].unique()) == {0, 1}


def test_model_trains_evaluates_scores_and_round_trips(tmp_path):
    frame = make_sample_data(rows=400)
    model, metrics = train_model(frame)
    scored = predict_churn(model, frame.head(5))
    model_path = tmp_path / "models" / "churn.joblib"
    save_model(model, model_path)
    restored = load_model(model_path)
    restored_scored = predict_churn(restored, frame.head(5))

    assert 0 <= metrics["roc_auc"] <= 1
    assert len(metrics["confusion_matrix"]) == 2
    assert scored["churn_probability"].between(0, 1).all()
    assert set(scored["predicted_churn"].unique()).issubset({0, 1})
    pd.testing.assert_series_equal(
        scored["churn_probability"], restored_scored["churn_probability"]
    )
    assert list(frame[FEATURE_COLUMNS].columns) == FEATURE_COLUMNS


def test_load_dataset_normalizes_yes_no_labels(tmp_path):
    frame = make_sample_data(rows=100)
    frame["Churn"] = frame["Churn"].map({0: "No", 1: "Yes"})
    csv_path = tmp_path / "customers.csv"
    frame.to_csv(csv_path, index=False)

    loaded = load_dataset(csv_path)

    assert set(loaded["Churn"].unique()) == {0, 1}