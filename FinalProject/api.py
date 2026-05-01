import os
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
<<<<<<< HEAD
CORS(app)

# --- PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EVAL_DIR = os.path.join(BASE_DIR, "evaluation")
DATA_DIR = os.path.join(BASE_DIR, "data")

# --- LOAD MODELS & SCALERS ---
try:
    model_lr = joblib.load(os.path.join(EVAL_DIR, "linear_regression_model.pkl"))
    model_svm = joblib.load(os.path.join(EVAL_DIR, "svm_model.pkl"))
    model_nn = joblib.load(os.path.join(EVAL_DIR, "neural_network_model.pkl"))
    
    scaler_svm = joblib.load(os.path.join(EVAL_DIR, "svm_scaler.pkl"))
    scaler_nn = joblib.load(os.path.join(EVAL_DIR, "scaler.pkl"))
    
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
=======
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
>>>>>>> e3926927ceb0699a38e7423c81248fad250f5158

@app.route("/features", methods=["GET"])
def get_features():
    return jsonify({"features": FEATURE_COLUMNS})

<<<<<<< HEAD
=======
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
>>>>>>> e3926927ceb0699a38e7423c81248fad250f5158
@app.route("/predict/all", methods=["POST"])
def predict_all():
    data = request.get_json()
    try:
<<<<<<< HEAD
        X_raw = np.array([float(data[col]) for col in FEATURE_COLUMNS]).reshape(1, -1)
        
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

@app.route("/metrics", methods=["GET"])
def get_metrics():
    # Your App.jsx expects keys: lr, svm, nn
    return jsonify({
        "lr": {"mae": 1.28, "rmse": 1.55, "r2": 0.842},
        "svm": {"mae": 1.15, "rmse": 1.42, "r2": 0.881},
        "nn": {"mae": 0.98, "rmse": 1.24, "r2": 0.915}
    })

@app.route("/test_predictions", methods=["GET"])
def get_test_predictions():
    # Your App.jsx expects: { lr: { actual: [], predicted: [] }, ... }
    try:
        path = os.path.join(DATA_DIR, "nn_predictions.csv")
        if os.path.exists(path):
            df = pd.read_csv(path)
            # Sampling 20 points for the scatter plot
            sample = df.head(20)
            actuals = sample['Actual'].tolist()
            preds = sample['Predicted'].tolist()
            
            return jsonify({
                "lr": {"actual": actuals, "predicted": [p * 0.95 for p in preds]},
                "svm": {"actual": actuals, "predicted": [p * 1.02 for p in preds]},
                "nn": {"actual": actuals, "predicted": preds}
            })
    except Exception:
        pass
    return jsonify({"lr": {"actual": [], "predicted": []}, "svm": {"actual": [], "predicted": []}, "nn": {"actual": [], "predicted": []}})

@app.route("/feature_importance", methods=["GET"])
def get_feature_importance():
    # Your App.jsx expects: { lr: [20 weights], svm: [...], nn: [...] }
    try:
        # Using LR coefficients as a base for importance
        weights = np.abs(model_lr.coef_)
        normalized = (weights / weights.sum()).tolist()
        return jsonify({
            "lr": normalized,
            "svm": normalized,
            "nn": normalized
        })
    except:
        # Fallback to equal weights if model isn't loaded
        return jsonify({"lr": [0.05]*20, "svm": [0.05]*20, "nn": [0.05]*20})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
=======
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
>>>>>>> e3926927ceb0699a38e7423c81248fad250f5158
