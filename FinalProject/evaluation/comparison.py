import os
import sys
import warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")        
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
import joblib

warnings.filterwarnings("ignore")

# Paths
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR  = os.path.join(BASE_DIR, "data")
EVAL_DIR  = os.path.dirname(os.path.abspath(__file__))
PLOTS_DIR = os.path.join(EVAL_DIR, "plots")
os.makedirs(PLOTS_DIR, exist_ok=True)

# Style
sns.set_theme(style="whitegrid", palette="muted")
COLORS = {
    "Linear Regression": "#4C72B0",
    "SVM Regression":    "#DD8452",
    "Neural Network":    "#55A868",
}
MODEL_NAMES = list(COLORS.keys())


# metric calculation
def build_metrics_table(lr_res, svm_res, nn_res) -> pd.DataFrame:
    rows = []
    for name, res in zip(MODEL_NAMES, [lr_res, svm_res, nn_res]):
        rows.append({
            "Model": name,
            "MAE":   round(res["MAE"],  4),
            "RMSE":  round(res["RMSE"], 4),
            "R²":    round(res["R2"],   4),
        })
    return pd.DataFrame(rows).set_index("Model")

def print_metrics_table(df: pd.DataFrame):
    print("\n" + "="*55)
    print("          MODEL COMPARISON — TEST SET METRICS")
    print("="*55)
    print(df.to_string())
    print("="*55)

def plot_feature_importance(X_test, y_test, model_lr, model_svm, model_nn):
    print("  Calculating feature importance (this may take a moment) ...")
    
    # Linear Regression Importance (Coefficients)
    lr_importance = np.abs(model_lr.coef_)
    
    # SVM Importance (Permutation)
    svm_perm = permutation_importance(model_svm, X_test, y_test, n_repeats=5, random_state=42)
    svm_importance = svm_perm.importances_mean

    # Neural Network Importance (Permutation)
    nn_perm = permutation_importance(model_nn, X_test, y_test, n_repeats=5, random_state=42)
    nn_importance = nn_perm.importances_mean

    features = X_test.columns if isinstance(X_test, pd.DataFrame) else [f"F{i}" for i in range(X_test.shape[1])]
    
    importance_df = pd.DataFrame({
        "Feature": features,
        "Linear Regression": lr_importance,
        "SVM Regression": svm_importance,
        "Neural Network": nn_importance
    }).set_index("Feature")

    # Plotting
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    for i, col in enumerate(importance_df.columns):
        data = importance_df[col].sort_values(ascending=True).tail(10) # Top 10
        axes[i].barh(data.index, data.values, color=COLORS[col])
        axes[i].set_title(f"Top Impact Factors\n({col})")
        axes[i].set_xlabel("Importance Score")

    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, "4_feature_importance.png")
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"  [saved] {path}")

def run_comparison():
    print("\n" + "═"*55)
    print("          EVALUATION & COMPARISON MODULE")
    print("═"*55)

    # Load Data for calculation
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "StressLevelDatasetCleaned.csv"))
        X = df.drop(columns=["anxiety_level"])
        y = df["anxiety_level"]
        from sklearn.model_selection import train_test_split
        _, X_test, _, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    except Exception as e:
        print(f"  [Error] Could not load dataset: {e}")
        return

    # Load result CSVs for metrics
    def load_csv(name):
        p = os.path.join(DATA_DIR, name)
        if not os.path.exists(p): p = os.path.join(EVAL_DIR, name)
        return pd.read_csv(p) if os.path.exists(p) else None

    lr_csv = load_csv("linear_regression_results.csv")
    svm_csv = load_csv("svm_results.csv")
    nn_csv = load_csv("nn_predictions.csv")

    if lr_csv is not None and svm_csv is not None and nn_csv is not None:
        # Build Results Dictionaries
        def get_metrics(df_res):
            act, pred = df_res["Actual"], df_res["Predicted"]
            mae = np.mean(np.abs(act - pred))
            rmse = np.sqrt(np.mean((act - pred)**2))
            r2 = 1 - (np.sum((act - pred)**2) / (np.sum((act - act.mean())**2) + 1e-9))
            return {"y_test": act, "y_pred": pred, "MAE": mae, "RMSE": rmse, "R2": r2}

        lr_res, svm_res, nn_res = get_metrics(lr_csv), get_metrics(svm_csv), get_metrics(nn_csv)
        
        metrics_df = build_metrics_table(lr_res, svm_res, nn_res)
        print_metrics_table(metrics_df)

        # Plot Metrics
        print("  Generating plots ...")
        
        # Linear Regression
        model_lr = LinearRegression().fit(X, y) 
        
        # SVM 
        from sklearn.preprocessing import StandardScaler
        sc = StandardScaler()
        X_sc = sc.fit_transform(X)
        model_svm = SVR(kernel='rbf', C=100).fit(X_sc, y)
        
        # Neural Network
        try:
            model_nn = joblib.load(os.path.join(EVAL_DIR, "neural_network_model.pkl"))
            plot_feature_importance(X_sc, y, model_lr, model_svm, model_nn)
        except Exception as e:
            print(f"  [skip] Could not load NN model file for importance: {e}")

        print("\n  Comparison complete! Check the 'plots' folder.")

if __name__ == "__main__":
    run_comparison()
