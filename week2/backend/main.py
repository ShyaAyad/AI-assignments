from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from solver import dfs
from utils import write_solution
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def ok():
    return {"message": "API is working!"}

@app.post("/solve")
async def solve(data: dict):
    input_board = data.get("board")

    if not input_board:
        return {"error": "Board is required"}

    try:
        board = tuple(item for row in input_board for item in row)
    except Exception:
        return {"error": "Invalid board format"}

    if len(board) != 9:
        return {"error": "Board must contain 9 values"}

    if sorted(board) != list(range(9)):
        return {"error": "Invalid board values"}

    # Measure execution time
    start = time.time()

    # Use depth limit
    path, cost = dfs(board, depth_limit=50)

    end = time.time()
    execution_time = end - start

    if path is None:
        return {
            "status": "error",
            "message": "No solution found within depth limit"
        }

    # Convert solution steps into 3x3 format 
    formatted_steps = []
    for state in path:
        b = state.board
        step_board = [
            list(b[0:3]),
            list(b[3:6]),
            list(b[6:9])
        ]
        formatted_steps.append(step_board)

    result = {
        "status": "success",
        "solution": formatted_steps,
        "cost": cost,
        "duration": execution_time
    }

    # Save result to file
    write_solution(result)

    return result