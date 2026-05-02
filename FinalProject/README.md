# Student Anxiety Predictor

A system that predicts student anxiety levels based on various factors using Machine Learning models. It features a Python data pipeline for model training and evaluation, a Flask backend for serving predictions, and a React frontend for interactive input and results visualization.

## How It Works
The system runs a pipeline of components to deliver the result:

1. **Data Preprocessing** – Cleans and prepares the dataset for model consumption.
2. **Model Training** – Trains three different models: Linear Regression, SVM Regression, and a Neural Network.
3. **Evaluation & Comparison** – Evaluates the models, comparing their performance metrics (MAE, RMSE, R²) and calculating feature importance.
4. **Flask API** – A backend service that loads the trained models and exposes endpoints for real-time anxiety prediction.
5. **React Frontend** – An interactive user interface that captures student factors and visualizes the model predictions and comparisons.

## Prerequisites
- Python 3.12
- Node.js (v18+)
- npm

## Installation

1. Setup the Python Environment
```bash
   pip install pandas scikit-learn flask flask-cors matplotlib seaborn joblib
```

2. Setup the Frontend
```bash
   cd frontend
   npm install
```

## Usage

### 1. Run the Data Pipeline
Before starting the backend, you must run the pipeline to process data, train the models, and generate the evaluation plots.
```bash
python main.py
```
*Note: This will generate `.pkl` model files in the `evaluation/` folder and results in the `data/` folder.*

### 2. Start the Backend
```bash
python api.py
```
The API will be running at `http://127.0.0.1:8000`.

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```
Open your browser and navigate to the provided local URL (usually `http://localhost:5173`).

## Project Structure
```
FinalProject/
├── main.py                  # Main Pipeline — runs preprocessing, training, and evaluation
├── api.py                   # Flask API — serves the trained models for prediction
├── data/                    # Data Storage — contains datasets and result CSVs
├── evaluation/
│   ├── comparison.py        # Evaluation Logic — compares models and generates metrics
│   └── plots/               # Visualizations — contains feature importance charts
├── models/
│   ├── linear_regression.py # Model Training — Linear Regression implementation
│   ├── neural_network.py    # Model Training — Neural Network implementation
│   └── svm.py               # Model Training — SVM implementation
├── preprocessing/
│   └── data_cleaning.py     # Data Prep — cleans and formats the initial dataset
└── frontend/
    ├── src/
    │   ├── App.jsx          # Root Component — manages state, API calls, and UI layout
    │   └── main.jsx         # Entry point — mounts the React application
    ├── package.json         # Project metadata and frontend dependencies
    └── vite.config.js       # Vite configuration
```
