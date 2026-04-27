import pandas as pd
from sklearn.model_selection import train_test_split

# Load Cleaned Data
df = pd.read_csv("../data/StressLevelDatasetCleaned.csv")


# Target Split
X = df.drop(columns=["anxiety_level"])
y = df["anxiety_level"]


# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
