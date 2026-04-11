# Book Arrangement Calculator 📚

A system that calculates the number of ways to arrange a subset of books from a total set using Permutations ($P(n, r)$) via a Dynamic Programming approach. It features a FastAPI backend for complex calculations and a React frontend for interactive visualization.

## How It Works
The system runs a pipeline of components to deliver the result:

1. **Input Interface Agent** – A React-based form that captures the total number of books ($n$) and the group size ($r$).
2. **Communication Agent** – Handles the asynchronous API requests between the frontend and the Python backend.
3. **DP Table Agent** – A backend logic layer that constructs a 2D Dynamic Programming table to solve permutation sub-problems efficiently.
4. **Permutation Solver** – Calculates the final arrangement count based on the populated DP table.
5. **Visualization Agent** – Renders the final result and provides an interactive modal to explore the full DP matrix.

## Prerequisites
- Python 3.12
- Node.js (v18+)
- npm

## Installation

1. Clone the repository
```bash
   git clone https://github.com/ShyaAyad/AI-assignments.git
   cd AI-assignments/week3
```

2. Setup the Backend
```bash
   cd backend
   pip install fastapi uvicorn
```

3. Setup the Frontend
```bash
   cd ../frontend
   npm install
```

## Usage

### 1. Start the Backend
```bash
cd backend
python -m uvicorn main:app --reload
```
The API will be running at `http://127.0.0.1:8000`.

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Open your browser and navigate to the provided local URL (usually `http://localhost:5173`).

## Project Structure
```
week3/
├── backend/
│   ├── main.py              # Main API — handles routing and requests
│   └── permutation.py       # Calculation Logic — builds the DP table
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root Component — manages state and layout
│   │   ├── BookArrangementCalculator.jsx # UI Agent — input form & result display
│   │   ├── TableModal.jsx   # Visualization Agent — renders the DP Table
│   │   ├── api.js           # API Helper — manages network requests
│   │   └── main.jsx         # Entry point — mounts the React application
│   ├── package.json         # Project metadata and dependencies
│   └── vite.config.js       # Vite configuration
└── README.md                # Project documentation
```
