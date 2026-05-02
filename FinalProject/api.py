import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

app = Flask(__name__)
CORS(app)

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EVAL_DIR = os.path.join(BASE_DIR, "evaluation")
DATA_DIR = os.path.join(BASE_DIR, "data")

# --- LOAD MODELS & SCALERS ---
try:
    model_lr = joblib.load(os.path.join(
        EVAL_DIR, "linear_regression_model.pkl"))
    model_svm = joblib.load(os.path.join(EVAL_DIR, "svm_model.pkl"))
    model_nn = joblib.load(os.path.join(EVAL_DIR, "neural_network_model.pkl"))

    scaler_svm = joblib.load(os.path.join(EVAL_DIR, "svm_scaler.pkl"))
    scaler_nn = joblib.load(os.path.join(EVAL_DIR, "scaler.pkl"))
    
    X_test_lr  = joblib.load(os.path.join(EVAL_DIR, "X_test_lr.pkl"))
    X_test_svm = joblib.load(os.path.join(EVAL_DIR, "X_test_svm.pkl"))
    X_test_nn  = joblib.load(os.path.join(EVAL_DIR, "X_test_nn.pkl"))
    y_test     = joblib.load(os.path.join(EVAL_DIR, "y_test.pkl"))

    # Feature names (Must be 20 features total)
    FEATURE_COLUMNS = [
        'sleep_quality', 'headache', 'blood_pressure', 'breathing_problem',
        'noise_level', 'living_conditions', 'safety', 'basic_needs',
        'academic_performance', 'study_load', 'teacher_student_relationship',
        'future_career_concerns', 'social_support', 'peer_pressure',
        'extracurricular_activities', 'bullying', 'self_esteem',
        'mental_health_history', 'depression', 'stress_level'
    ]
except Exception as e:
    print(f"Error loading assets: {e}")

# --- ROUTES ---
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/features", methods=["GET"])
def get_features():
    return jsonify({"features": FEATURE_COLUMNS})


@app.route("/predict/all", methods=["POST"])
def predict_all():
    data = request.get_json()
    try:
        X_raw = np.array([float(data[col])
                         for col in FEATURE_COLUMNS]).reshape(1, -1)

        pred_lr = model_lr.predict(X_raw)[0]
        pred_svm = model_svm.predict(scaler_svm.transform(X_raw))[0]
        pred_nn = model_nn.predict(scaler_nn.transform(X_raw))[0]

        return jsonify({
            "predictions": {
                "Linear Regression": float(pred_lr),
                "SVM Regression": float(pred_svm),
                "Neural Network": float(pred_nn),
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# dynamically calculate metrics
@app.route("/metrics", methods=["GET"])
def get_metrics():
    def calc(actual, predicted):
        return {
            "mae":  round(float(mean_absolute_error(actual, predicted)), 3),
            "rmse": round(float(np.sqrt(mean_squared_error(actual, predicted))), 3),
            "r2":   round(float(r2_score(actual, predicted)), 3)
        }

    return jsonify({
        "lr":  calc(y_test, model_lr.predict(X_test_lr)),
        "svm": calc(y_test, model_svm.predict(X_test_svm)),
        "nn":  calc(y_test, model_nn.predict(X_test_nn))
    })


@app.route("/test_predictions", methods=["GET"])
def get_test_predictions():
    try:
        path = os.path.join(DATA_DIR, "nn_predictions.csv")
        if os.path.exists(path):
            
            lr_df  = pd.read_csv(os.path.join(DATA_DIR, "linear_regression_results.csv"))
            svm_df = pd.read_csv(os.path.join(DATA_DIR, "svm_results.csv"))
            nn_df  = pd.read_csv(os.path.join(DATA_DIR, "nn_predictions.csv"))

            return jsonify({
            "lr": {
                "actual":    lr_df.head(20)['Actual'].tolist(),
                "predicted": lr_df.head(20)['Predicted'].tolist()
            },
            "svm": {
                "actual":    svm_df.head(20)['Actual'].tolist(),
                "predicted": svm_df.head(20)['Predicted'].tolist()
            },
            "nn": {
                "actual":    nn_df.head(20)['Actual'].tolist(),
                "predicted": nn_df.head(20)['Predicted'].tolist()
            }
        })
    except Exception:
        pass
    return jsonify({"lr": {"actual": [], "predicted": []}, "svm": {"actual": [], "predicted": []}, "nn": {"actual": [], "predicted": []}})


@app.route("/feature_importance", methods=["GET"])
def get_feature_importance():
    try:
       # LR — use coefficients directly
        lr_weights = np.abs(model_lr.coef_)
        lr_normalized = (lr_weights / lr_weights.sum()).tolist()

        # SVM — use permutation importance
        svm_result = permutation_importance(
            model_svm, X_test_svm, y_test,
            n_repeats=10, random_state=42
        )
        svm_weights = np.abs(svm_result.importances_mean)
        svm_normalized = (svm_weights / svm_weights.sum()).tolist()

        # NN — use permutation importance
        nn_result = permutation_importance(
            model_nn, X_test_nn, y_test,
            n_repeats=10, random_state=42
        )
        nn_weights = np.abs(nn_result.importances_mean)
        nn_normalized = (nn_weights / nn_weights.sum()).tolist()

        return jsonify({
            "lr":  lr_normalized,
            "svm": svm_normalized,
            "nn":  nn_normalized
        })
    except:
        # Fallback to equal weights if model isn't loaded
        return jsonify({"lr": [0.05]*20, "svm": [0.05]*20, "nn": [0.05]*20})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
