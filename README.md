# Customer Churn Prediction

A local telecom customer retention workbench. It trains a class-weighted logistic regression pipeline, reports holdout performance, and scores customers with estimated churn probabilities. A deterministic synthetic dataset keeps the project runnable without downloads or credentials.

## Setup

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## Run the dashboard

```powershell
streamlit run app.py
```

Use the sidebar to load a CSV instead of the generated demo data. Input CSVs must include `Churn` and the feature columns defined in `churn_prediction/data.py`. The target accepts `0`/`1` or `No`/`Yes`.

## Train from the command line

```powershell
python -m churn_prediction.train
python -m churn_prediction.train --data path\to\customers.csv --model models\churn_model.joblib
```

The default command trains on generated demo data, saves the fitted pipeline under `models/`, and writes holdout metrics to `reports/metrics.json`.

## Tests

```powershell
python -m pytest
```

## Model notes

Preprocessing is fitted inside the scikit-learn pipeline to avoid data leakage. Numerical features are imputed and scaled; categorical features are imputed and one-hot encoded. The logistic regression classifier uses balanced class weights. The dashboard reports precision, recall, F1, ROC-AUC, accuracy, and a confusion matrix. The generated data is synthetic and intended for development only; validate performance on representative, consented business data before operational use.