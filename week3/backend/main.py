# pip install fastapi uvicorn
# to run: python -m uvicorn main:app --reload

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from permutation import compute_permutation

app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later you can restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request format from frontend
class InputData(BaseModel):
    n: int
    r: int


@app.get("/")
def home():
    return {"message": "Permutation API is running"}

# API endpoint


@app.post("/solve")
def solve(data: InputData):
    n = data.n
    r = data.r

    # VALIDATION
    if n < 0 or r < 0:
        return {"error": "Numbers must be non-negative"}

    if r > n:
        return {"error": "Group size cannot exceed total books"}

    if n == 0 and r > 0:
        return {"error": "Cannot choose books from zero total books"}

    # CALL YOUR LOGIC
    result_data = compute_permutation(n, r)

    # SEND BACK TO FRONTEND
    return result_data
