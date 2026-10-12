"""Streamlit customer churn workbench."""

import pandas as pd
import streamlit as st

from churn_prediction.data import FEATURE_COLUMNS, load_dataset
from churn_prediction.model import predict_churn, train_model


st.set_page_config(page_title="Retention Workbench", page_icon="↗", layout="wide")
st.title("Retention Workbench")
st.caption("Customer churn signals and retention prioritization")

with st.sidebar:
    st.header("Data")
    uploaded = st.file_uploader("Training data (CSV)", type="csv")
    st.caption("CSV must include the customer features and a Churn target column.")

try:
    if uploaded:
        customers = load_dataset(uploaded)
        source_label = uploaded.name
    else:
        customers = load_dataset()
        source_label = "Generated demo data"
    model, metrics = train_model(customers)
except (ValueError, KeyError) as error:
    st.error(str(error))
    st.stop()

st.caption(f"Data source: {source_label} · {len(customers):,} customers")
metric_columns = st.columns(4)
metric_columns[0].metric("Churn rate", f"{customers['Churn'].mean():.1%}")
metric_columns[1].metric("Holdout ROC-AUC", f"{metrics['roc_auc']:.3f}")
metric_columns[2].metric("Holdout recall", f"{metrics['recall']:.1%}")
metric_columns[3].metric("Customers", f"{len(customers):,}")

left, right = st.columns([1, 1])
with left:
    st.subheader("Churn profile")
    st.bar_chart(customers.groupby("Contract")["Churn"].mean().sort_values(ascending=False))
with right:
    st.subheader("Holdout confusion matrix")
    matrix = pd.DataFrame(
        metrics["confusion_matrix"],
        index=["Actual: stay", "Actual: churn"],
        columns=["Predicted: stay", "Predicted: churn"],
    )
    st.dataframe(matrix, use_container_width=True)

st.subheader("Score a customer")
with st.form("customer_form"):
    row_a, row_b, row_c = st.columns(3)
    with row_a:
        tenure = st.number_input("Tenure (months)", min_value=0, max_value=72, value=8)
        monthly_charges = st.number_input("Monthly charges", min_value=0.0, max_value=250.0, value=79.9)
        senior = st.selectbox("Senior citizen", [0, 1], format_func=lambda value: "Yes" if value else "No")
        dependents = st.selectbox("Has dependents", ["No", "Yes"])
    with row_b:
        contract = st.selectbox("Contract", ["Month-to-month", "One year", "Two year"])
        internet = st.selectbox("Internet service", ["Fiber optic", "DSL", "No"])
        payment = st.selectbox(
            "Payment method", ["Electronic check", "Mailed check", "Bank transfer", "Credit card"]
        )
    with row_c:
        paperless = st.selectbox("Paperless billing", ["Yes", "No"])
        tech_support = st.selectbox("Tech support", ["No", "Yes", "No internet service"])
        online_security = st.selectbox("Online security", ["No", "Yes", "No internet service"])
    submitted = st.form_submit_button("Estimate churn risk", type="primary")

if submitted:
    customer = pd.DataFrame(
        [
            {
                "SeniorCitizen": senior,
                "tenure": tenure,
                "MonthlyCharges": monthly_charges,
                "TotalCharges": tenure * monthly_charges,
                "Contract": contract,
                "InternetService": internet,
                "PaymentMethod": payment,
                "PaperlessBilling": paperless,
                "TechSupport": tech_support,
                "OnlineSecurity": online_security,
                "Dependents": dependents,
            }
        ],
        columns=FEATURE_COLUMNS,
    )
    scored = predict_churn(model, customer).iloc[0]
    probability = scored["churn_probability"]
    st.metric("Estimated churn probability", f"{probability:.1%}")
    if probability >= 0.65:
        st.warning("High risk: prioritize a retention conversation.")
    elif probability >= 0.35:
        st.info("Moderate risk: consider a proactive check-in.")
    else:
        st.success("Lower risk based on this model.")

st.divider()
st.subheader("Highest-risk customers in this dataset")
scored_customers = predict_churn(model, customers)
high_risk = scored_customers.sort_values("churn_probability", ascending=False).head(10)
display_columns = [
    column
    for column in ["customerID", "Contract", "tenure", "MonthlyCharges", "churn_probability", "Churn"]
    if column in high_risk.columns
]
st.dataframe(
    high_risk[display_columns].style.format({"churn_probability": "{:.1%}", "MonthlyCharges": "${:.2f}"}),
    use_container_width=True,
    hide_index=True,
)