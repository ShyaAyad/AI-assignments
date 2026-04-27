import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
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

# building neural network
model = keras.Sequential([
    layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    layers.Dense(32, activation='relu'),
    layers.Dense(1)
])

# compile the model 
model.compile(
    optimizer='adam',
    loss='mse',
    metrics=['mae']
)

early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

# train model
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=16,
    callbacks=[early_stop],
    verbose=1
)

# evaluate model
test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)

# Predictions
y_pred = model.predict(X_test).flatten()

# Metrics
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print("\n===== Evaluation Results =====")
print(f"MAE  : {test_mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")

model.save("neural_network_model.h5")

results = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred.flatten()
})

results.to_csv("nn_predictions.csv", index=False)

print("\nModel and predictions saved successfully.")