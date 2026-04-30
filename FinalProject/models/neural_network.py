import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.neural_network import MLPRegressor
import joblib

# Load Cleaned Data
df = pd.read_csv("../data/StressLevelDatasetCleaned.csv")


X = df.drop(columns=["anxiety_level"]) # input (categories like sleep, depression...etc)
y = df["anxiety_level"] # output (anxiety level)


# Train-Test Split -> 70% train, 30% temp
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Validation-Test Split -> 15% validation, 15% test
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)

# Feature Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val = scaler.transform(X_val)
X_test = scaler.transform(X_test)

joblib.dump(scaler, "scaler.pkl")

# building and training neural network using sklearn
model = MLPRegressor(
    hidden_layer_sizes=(64, 32),
    activation='relu',
    solver='adam',
    batch_size=16,
    max_iter=100,
    early_stopping=True,
    n_iter_no_change=5,
    random_state=42,
    verbose=True
)

# train model (MLPRegressor handles validation internally if early_stopping=True, 
# but here we just fit on train data)
model.fit(X_train, y_train)

# evaluate model
# Predictions
y_pred = model.predict(X_test)
test_mae = np.mean(np.abs(y_test - y_pred))

# Metrics
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n===== Evaluation Results =====")
print(f"MAE  : {test_mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")

joblib.dump(model, "../evaluation/neural_network_model.pkl")

results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred
})

results.to_csv("../data/nn_predictions.csv", index=False)

print("\nModel and predictions saved successfully.")
