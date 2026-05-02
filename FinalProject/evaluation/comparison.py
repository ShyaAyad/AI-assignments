import os  # for file and directory operations
import sys  # system-related functions (not heavily used here)
import warnings  # to control warning messages

import numpy as np  # numerical operations
import pandas as pd  # data handling

import matplotlib
matplotlib.use("Agg")        # use non-GUI backend (plots will be saved, not shown)

import matplotlib.pyplot as plt  # plotting
import seaborn as sns  # nicer plot styling

from sklearn.inspection import permutation_importance  # feature importance method
from sklearn.linear_model import LinearRegression  # linear regression model
from sklearn.svm import SVR  # support vector regression model

import joblib  # for loading saved models

warnings.filterwarnings("ignore")  # suppress warning messages


# -------------------- Paths --------------------
BASE_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # project root folder
DATA_DIR  = os.path.join(BASE_DIR, "data")  # path to data folder
EVAL_DIR  = os.path.dirname(os.path.abspath(__file__))  # current folder (evaluation)
PLOTS_DIR = os.path.join(EVAL_DIR, "plots")  # folder to save plots

os.makedirs(PLOTS_DIR, exist_ok=True)  # create plots folder if it doesn't exist


# -------------------- Style --------------------
sns.set_theme(style="whitegrid", palette="muted")  # set plot style

COLORS = {
    "Linear Regression": "#4C72B0",  # blue
    "SVM Regression":    "#DD8452",  # orange
    "Neural Network":    "#55A868",  # green
}

MODEL_NAMES = list(COLORS.keys())  # list of model names


# -------------------- Metric Table --------------------
def build_metrics_table(lr_res, svm_res, nn_res) -> pd.DataFrame:
    rows = []  # store results
    
    # loop through models and their results
    for name, res in zip(MODEL_NAMES, [lr_res, svm_res, nn_res]):
        rows.append({
            "Model": name,
            "MAE":   round(res["MAE"],  4),   # Mean Absolute Error
            "RMSE":  round(res["RMSE"], 4),   # Root Mean Squared Error
            "R²":    round(res["R2"],   4),   # R-squared
        })
    
    return pd.DataFrame(rows).set_index("Model")  # convert to table


def print_metrics_table(df: pd.DataFrame):
    print("\n" + "="*55)
    print("          MODEL COMPARISON — TEST SET METRICS")
    print("="*55)
    print(df.to_string())  # print table
    print("="*55)


# -------------------- Feature Importance --------------------
def plot_feature_importance(X_test, y_test, model_lr, model_svm, model_nn):
    print("  Calculating feature importance (this may take a moment) ...")
    
    # Linear Regression Importance (absolute value of coefficients)
    lr_importance = np.abs(model_lr.coef_)
    
    # SVM Importance using permutation
    svm_perm = permutation_importance(
        model_svm, X_test, y_test, n_repeats=5, random_state=42
    )
    svm_importance = svm_perm.importances_mean  # average importance

    # Neural Network Importance using permutation
    nn_perm = permutation_importance(
        model_nn, X_test, y_test, n_repeats=5, random_state=42
    )
    nn_importance = nn_perm.importances_mean

    # get feature names
    if isinstance(X_test, pd.DataFrame):
        features = X_test.columns
    else:
        features = [f"F{i}" for i in range(X_test.shape[1])]

    # combine all importance values into one DataFrame
    importance_df = pd.DataFrame({
        "Feature": features,
        "Linear Regression": lr_importance,
        "SVM Regression": svm_importance,
        "Neural Network": nn_importance
    }).set_index("Feature")

    # -------------------- Plotting --------------------
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))  # 3 plots side by side

    for i, col in enumerate(importance_df.columns):
        # take top 10 most important features
        data = importance_df[col].sort_values(ascending=True).tail(10)
        
        axes[i].barh(data.index, data.values, color=COLORS[col])  # horizontal bar plot
        axes[i].set_title(f"Top Impact Factors\n({col})")
        axes[i].set_xlabel("Importance Score")

    plt.tight_layout()

    path = os.path.join(PLOTS_DIR, "4_feature_importance.png")  # save path
    plt.savefig(path, dpi=150)  # save image
    plt.close()

    print(f"  [saved] {path}")


# -------------------- Main Function --------------------
def run_comparison():
    print("\n" + "═"*55)
    print("          EVALUATION & COMPARISON MODULE")
    print("═"*55)

    # -------- Load dataset --------
    try:
        df = pd.read_csv(os.path.join(DATA_DIR, "StressLevelDatasetCleaned.csv"))
        
        X = df.drop(columns=["anxiety_level"])  # features
        y = df["anxiety_level"]  # target
        
        from sklearn.model_selection import train_test_split
        
        # create test split (NOTE: this is a new split, not same as training scripts)
        _, X_test, _, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )
        
    except Exception as e:
        print(f"  [Error] Could not load dataset: {e}")
        return

    # -------- Load saved result CSVs --------
    def load_csv(name):
        p = os.path.join(DATA_DIR, name)  # try data folder
        
        if not os.path.exists(p):
            p = os.path.join(EVAL_DIR, name)  # try evaluation folder
        
        return pd.read_csv(p) if os.path.exists(p) else None

    lr_csv = load_csv("linear_regression_results.csv")
    svm_csv = load_csv("svm_results.csv")
    nn_csv = load_csv("nn_predictions.csv")

    # -------- Calculate Metrics --------
    if lr_csv is not None and svm_csv is not None and nn_csv is not None:

        def get_metrics(df_res):
            act = df_res["Actual"]      # true values
            pred = df_res["Predicted"] # predicted values

            # MAE
            mae = np.mean(np.abs(act - pred))

            # RMSE
            rmse = np.sqrt(np.mean((act - pred)**2))

            # R²
            r2 = 1 - (np.sum((act - pred)**2) /
                      (np.sum((act - act.mean())**2) + 1e-9))

            return {"y_test": act, "y_pred": pred, "MAE": mae, "RMSE": rmse, "R2": r2}

        # compute metrics for each model
        lr_res  = get_metrics(lr_csv)
        svm_res = get_metrics(svm_csv)
        nn_res  = get_metrics(nn_csv)

        # build and print table
        metrics_df = build_metrics_table(lr_res, svm_res, nn_res)
        print_metrics_table(metrics_df)

        print("  Generating plots ...")

        # -------- Recreate Models for Feature Importance --------

        # Linear Regression (trained on full data)
        model_lr = LinearRegression().fit(X, y)

        # SVM (scaled data required)
        from sklearn.preprocessing import StandardScaler
        sc = StandardScaler()
        X_sc = sc.fit_transform(X)

        model_svm = SVR(kernel='rbf', C=100).fit(X_sc, y)

        # Neural Network (load saved model)
        try:
            model_nn = joblib.load(os.path.join(EVAL_DIR, "neural_network_model.pkl"))

            # plot feature importance
            plot_feature_importance(X_sc, y, model_lr, model_svm, model_nn)

        except Exception as e:
            print(f"  [skip] Could not load NN model file for importance: {e}")

        print("\n  Comparison complete! Check the 'plots' folder.")


# -------------------- Entry Point --------------------
if __name__ == "__main__":
    run_comparison()  # run the comparison
