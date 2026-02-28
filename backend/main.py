from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from solver import dfs 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/solve")
async def solve_puzzle(data: dict):
    input_board = data.get("board")
    flat_board = tuple(item for row in input_board for item in row)
    
    # CALL DFS WITH THE LIMIT SPECIFIED
    path_states, cost = dfs(flat_board, depth_limit=50)
    
    if path_states:
        # Convert PuzzleState objects to 3x3 list format
        formatted_steps = []
        for state in path_states:
            b = state.board
            step_board = [list(b[0:3]), list(b[3:6]), list(b[6:9])]
            formatted_steps.append(step_board)
            
        return {"status": "success", "solution": formatted_steps, "cost": cost}
    
    return {"status": "error", "message": "No solution found within depth limit."}