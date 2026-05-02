import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from scipy import stats


df = pd.read_csv("../data/StressLevelDataset.csv")


# Handling missing values
# Fill numeric columns with mean
for col in df.select_dtypes(include=np.number):
    df[col] = df[col].fillna(df[col].mean())

# Fill categorical columns with mode
for col in df.select_dtypes(include='object'):
    df[col] = df[col].fillna(df[col].mode()[0])


# Encoding Categorical Data
le = LabelEncoder()
# change categorical text into numbers
for col in df.select_dtypes(include='object'):
    df[col] = le.fit_transform(df[col])


# Removing Duplicates
df = df.drop_duplicates()


# Remove Outliers
z_scores = np.abs(stats.zscore(df.select_dtypes(include=np.number)))
df = df[(z_scores < 3).all(axis=1)]


# Save Cleaned Data
df.to_csv("../data/StressLevelDatasetCleaned.csv", index=False)
