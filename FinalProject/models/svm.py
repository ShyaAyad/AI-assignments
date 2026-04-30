import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Load Cleaned Data
df = pd.read_csv("../data/StressLevelDatasetCleaned.csv")

# Target Split
X = df.drop(columns=["anxiety_level"])
y = df["anxiety_level"]

# Train-Test Split -> 70% train, 30% temp
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# Validation-Test Split -> 15% validation, 15% test
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)
# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val = scaler.transform(X_val)  
X_test = scaler.transform(X_test)

# SVM Regression Model
model = SVR(kernel='rbf', C=100, gamma=0.1, epsilon=0.1)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluation
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

joblib.dump(model, "../evaluation/svm_model.pkl")
joblib.dump(scaler, "../evaluation/svm_scaler.pkl")

print("SVM Regression Results")
print("MAE:", mae)
print("RMSE:", rmse)
print("R2 Score:", r2)

# Save Results
results = pd.DataFrame({
    "Actual": y_test,
    "Predicted": y_pred
})
results.to_csv("../data/svm_results.csv", index=False)