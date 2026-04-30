import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow frontend requests

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
EVAL_DIR  = os.path.join(BASE_DIR, "evaluation")
DATA_DIR  = os.path.join(BASE_DIR, "data")

# feature columns coming from the dataset
FEATURE_COLUMNS = [col for col in pd.read_csv(
    os.path.join(DATA_DIR, "StressLevelDatasetCleaned.csv")
).columns if col != "anxiety_level"]

# load models
print("Loading models...")

model_lr  = joblib.load(os.path.join(EVAL_DIR, "linear_regression_model.pkl"))
model_svm = joblib.load(os.path.join(EVAL_DIR, "svm_model.pkl"))
model_nn  = joblib.load(os.path.join(EVAL_DIR, "neural_network_model.pkl"))
scaler_svm = joblib.load(os.path.join(EVAL_DIR, "svm_scaler.pkl"))
scaler_nn  = joblib.load(os.path.join(BASE_DIR, "models", "scaler.pkl"))

print(f"Models loaded. Expected features: {FEATURE_COLUMNS}")

def parse_features(data: dict) -> np.ndarray:
    try:
        values = [float(data[col]) for col in FEATURE_COLUMNS]
    except KeyError as e:
        raise ValueError(f"Missing feature in request: {e}")
    return np.array(values).reshape(1, -1)

# routes that frontend can use
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Anxiety Level Prediction API is running."})

@app.route("/features", methods=["GET"])
def get_features():
    return jsonify({"features": FEATURE_COLUMNS})

# to predict anxiety level using Linear regression model
@app.route("/predict/linear", methods=["POST"])
def predict_linear():
    data = request.get_json()
    try:
        X = parse_features(data)
        prediction = model_lr.predict(X)[0]
        return jsonify({
            "model": "Linear Regression",
            "anxiety_level": round(float(prediction), 4)
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# to predict anxiety level using SVM model
@app.route("/predict/svm", methods=["POST"])
def predict_svm():
    data = request.get_json()
    try:
        X = parse_features(data)
        X_scaled = scaler_svm.transform(X)
        prediction = model_svm.predict(X_scaled)[0]
        return jsonify({
            "model": "SVM Regression",
            "anxiety_level": round(float(prediction), 4)
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# to predict anxiety level using neural network model
@app.route("/predict/nn", methods=["POST"])
def predict_nn():
    data = request.get_json()
    try:
        X = parse_features(data)
        X_scaled = scaler_nn.transform(X)
        prediction = model_nn.predict(X_scaled)[0]
        return jsonify({
            "model": "Neural Network",
            "anxiety_level": round(float(prediction), 4)
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# to predict anxiety level using all the models together
@app.route("/predict/all", methods=["POST"])
def predict_all():
    data = request.get_json()
    try:
        X = parse_features(data)

        pred_lr  = model_lr.predict(X)[0]
        pred_svm = model_svm.predict(scaler_svm.transform(X))[0]
        pred_nn  = model_nn.predict(scaler_nn.transform(X))[0]

        return jsonify({
            "predictions": {
                "Linear Regression": round(float(pred_lr),  4),
                "SVM Regression":    round(float(pred_svm), 4),
                "Neural Network":    round(float(pred_nn),  4),
            }
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=8000)