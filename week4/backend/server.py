from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import uuid
import random

from ga_engine import genetic_algorithm

app = FastAPI(title="Sudoku GA Solver")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# checking if the number is placed in a correct cell
def _is_valid_placement(board, row, col, num):
    if num in board[row]:
        return False
    if num in (board[r][col] for r in range(9)):
        return False
    br, bc = (row // 3) * 3, (col // 3) * 3
    for r in range(br, br + 3):
        for c in range(bc, bc + 3):
            if board[r][c] == num:
                return False
    return True


def _solve(board):
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                nums = list(range(1, 10))
                random.shuffle(nums)
                for num in nums:
                    if _is_valid_placement(board, r, c, num):
                        board[r][c] = num
                        if _solve(board):
                            return True
                        board[r][c] = 0
                return False
    return True

# generating random board with some prefilled cells
def generate_random_board(clues: int = 30) -> List[List[int]]:

    board = [[0] * 9 for _ in range(9)]
    _solve(board)

    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)
    to_remove = 81 - clues

    for r, c in cells[:to_remove]:
        board[r][c] = 0

    return board

# checking if the added numbers position is correct or not
def get_conflicts(board: List[List[int]]) -> List[dict]:

    conflicts = [[set() for _ in range(9)] for _ in range(9)]

    # Check rows
    for r in range(9):
        seen = {}
        for c in range(9):
            val = board[r][c]
            if val == 0:
                continue
            if val in seen:
                conflicts[r][c].add("row")
                conflicts[r][seen[val]].add("row")
            else:
                seen[val] = c

    # Check columns
    for c in range(9):
        seen = {}
        for r in range(9):
            val = board[r][c]
            if val == 0:
                continue
            if val in seen:
                conflicts[r][c].add("column")
                conflicts[seen[val]][c].add("column")
            else:
                seen[val] = r

    # Check 3x3 boxes
    for br in (0, 3, 6):
        for bc in (0, 3, 6):
            seen = {}
            for i in range(3):
                for j in range(3):
                    r, c = br + i, bc + j
                    val = board[r][c]
                    if val == 0:
                        continue
                    if val in seen:
                        conflicts[r][c].add("box")
                        conflicts[seen[val][0]][seen[val][1]].add("box")
                    else:
                        seen[val] = (r, c)

    result = []
    for r in range(9):
        for c in range(9):
            if conflicts[r][c]:
                result.append({
                    "row": r,
                    "col": c,
                    "reasons": list(conflicts[r][c])
                })
    return result


def is_solved(board: List[List[int]]) -> bool:
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                return False
    return len(get_conflicts(board)) == 0


# In-memory job store 
jobs: dict = {}

class BoardRequest(BaseModel):
    board: List[List[int]]

class SolveResponse(BaseModel):
    job_id: str

class GenerationResult(BaseModel):
    generation: int
    fitness: int
    board: List[List[int]]

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    results: List[GenerationResult] = []
    error: Optional[str] = None

class ConflictDetail(BaseModel):
    row: int
    col: int
    reasons: List[str]

class ValidateResponse(BaseModel):
    solved: bool
    conflicts: List[ConflictDetail]
    message: str

class CheckCellRequest(BaseModel):
    board: List[List[int]]  
    row: int
    col: int
    value: int           


class CheckCellResponse(BaseModel):
    valid: bool
    reasons: List[str]
    message: str


# background solver 
def _run_ga(job_id: str, board: List[List[int]]):
    try:
        results = genetic_algorithm(board)
        jobs[job_id]["results"] = results
        jobs[job_id]["status"] = "done"
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)

# endpoints 
@app.get("/board/new", response_model=dict)
def get_new_board(clues: int = Query(default=30, ge=25, le=50)):

    return {"board": generate_random_board(clues)}


@app.post("/solve", response_model=SolveResponse)
async def solve(request: BoardRequest):

    board = request.board

    if len(board) != 9 or any(len(row) != 9 for row in board):
        raise HTTPException(status_code=400, detail="Board must be 9x9.")

    for row in board:
        for cell in row:
            if not (0 <= cell <= 9):
                raise HTTPException(
                    status_code=400,
                    detail="Cell values must be 0 (empty) or 1-9."
                )

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "running", "results": [], "error": None}

    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, _run_ga, job_id, board)

    return {"job_id": job_id}


@app.get("/status/{job_id}", response_model=JobStatusResponse)
def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")

    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "results": job["results"],
        "error": job["error"],
    }


@app.post("/validate", response_model=ValidateResponse)
def validate(request: BoardRequest):
    
    board = request.board

    if len(board) != 9 or any(len(row) != 9 for row in board):
        raise HTTPException(status_code=400, detail="Board must be 9x9.")

    conflicts = get_conflicts(board)
    solved = is_solved(board)

    if solved:
        message = "Congratulations! The puzzle is solved correctly."
    elif any(board[r][c] == 0 for r in range(9) for c in range(9)):
        message = "The board is not complete yet."
    else:
        message = f"The board has {len(conflicts)} conflict(s). Check the highlighted cells."

    return {
        "solved": solved,
        "conflicts": conflicts,
        "message": message,
    }

# frontend calls this endpoint to check if the number is in the correct cell
@app.post("/check-cell", response_model=CheckCellResponse)
def check_cell(request: CheckCellRequest):

    board = request.board
    r, c, val = request.row, request.col, request.value

    if not (0 <= r <= 8 and 0 <= c <= 8):
        raise HTTPException(status_code=400, detail="Row and col must be 0-8.")
    if not (1 <= val <= 9):
        raise HTTPException(status_code=400, detail="Value must be 1-9.")

    reasons = []

    # Check row
    for col_i in range(9):
        if col_i != c and board[r][col_i] == val:
            reasons.append("row")
            break

    # Check column
    for row_i in range(9):
        if row_i != r and board[row_i][c] == val:
            reasons.append("column")
            break

    # Check 3x3 box
    br, bc = (r // 3) * 3, (c // 3) * 3
    for i in range(3):
        for j in range(3):
            ri, ci = br + i, bc + j
            if (ri != r or ci != c) and board[ri][ci] == val:
                reasons.append("box")
                break

    valid = len(reasons) == 0

    if valid:
        message = "Valid placement."
    else:
        readable = " and ".join(reasons)
        message = f"Invalid: {val} already exists in the {readable}."

    return {"valid": valid, "reasons": reasons, "message": message}


@app.get("/health")
def health():
    return {"status": "ok"}