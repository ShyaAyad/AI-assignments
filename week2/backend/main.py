from fastapi import FastAPI
from solver import dfs # import dfs function for solving the puzzle
from utils import write_solution # write the result into a file 
import time

app = FastAPI()

@app.get('/')
def ok():
    return {"message": "API is working!"}

@app.post('/solve') # api endpoint for sending the puzzle from the frontend and solve it in the backend
def solve(data: dict):
    board = tuple(data["board"])
    
    if(len(board) != 9):
        return {"error": "Invalid board, board must contain 9 values"}
    
    if sorted(board) != list(range(9)):
        return {"error": "Invalid board values"}

    # calculate how much it costs to solve the problem 
    start = time.time()
    path, cost = dfs(board)
    end = time.time()
    
    executionTime = end - start

    if path is None:
        return {"error": "No solution found"}

    # Convert path to simple list format for frontend
    steps = [list(state.board) for state in path]

    result = {
        "steps": steps,
        "cost": cost,
        "duration": executionTime
    }

    write_solution(result)

    return result