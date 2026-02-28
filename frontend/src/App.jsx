import { useState, useEffect } from "react";
import Board from "./components/Board";
import Controls from "./components/Controls";
import StepViewer from "./components/StepViewer";
import { solvePuzzle } from "./api";

function generateRandomBoard() {
  // Start at the solved goal state
  let board = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];

  //Find the blank tile (0)
  const findBlank = (b) => {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        if (b[r][c] === 0) return [r, c];
  };

  // Perform 50 random valid moves to scramble the board
  for (let i = 0; i < 50; i++) {
    const [r, c] = findBlank(board);
    const moves = [];
    if (r > 0) moves.push([r - 1, c]); // Up
    if (r < 2) moves.push([r + 1, c]); // Down
    if (c > 0) moves.push([r, c - 1]); // Left
    if (c < 2) moves.push([r, c + 1]); // Right

    // Pick a random neighbor to swap with
    const [nr, nc] = moves[Math.floor(Math.random() * moves.length)];
    
    // Swap tiles
    [board[r][c], board[nr][nc]] = [board[nr][nc], board[r][c]];
  }

  return board;
}

function App() {
  // Using () => generateRandomBoard() ensures it only runs on mount
  const [board, setBoard] = useState(() => generateRandomBoard());
  const [steps, setSteps] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying && steps && currentStepIndex < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, 500);
    } else {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps]);

  const handleSolve = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await solvePuzzle(board);
      if (result.status === "success") {
        setSteps(result.solution);
        setCurrentStepIndex(0);
      } else {
        setError(result.message || "Could not solve puzzle.");
      }
    } catch (err) {
      setError("Backend connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    setBoard(generateRandomBoard());
    setSteps(null);
    setCurrentStepIndex(0);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-6">8-Puzzle Solver</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Renders solved steps if available, otherwise shows the current board */}
      <Board board={steps ? steps[currentStepIndex] : board} />
      
      <div className="mt-6 flex gap-4">
        <Controls onSolve={handleSolve} />
        <button 
          onClick={handleNewGame}
          className="bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-yellow-600 transition"
        >
          New Game
        </button>
      </div>
      
      {steps && (
        <StepViewer 
          steps={steps}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
    </div>
  );
}

export default App;