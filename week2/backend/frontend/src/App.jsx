import { useState } from "react";
import Board from "./components/Board";
import Controls from "./components/Controls";
import StepViewer from "./components/StepViewer";
import { solvePuzzle } from "./api";

// shuffle function for random board
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// generate 3x3 random board
function generateRandomBoard() {
  const numbers = [0,1,2,3,4,5,6,7,8]; // 0 = empty tile
  const shuffled = shuffleArray(numbers);
  return [
    shuffled.slice(0,3),
    shuffled.slice(3,6),
    shuffled.slice(6,9)
  ];
}

export default function App() {
  // random board on each run
  const [board] = useState(generateRandomBoard());
  const [cost, setCost] = useState(null);
  const [steps, setSteps] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    try {
      setLoading(true);
      const result = await solvePuzzle(board);
      setCost(result.cost);
      setSteps(result.steps);
    } catch (error) {
      alert("Backend not running!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-r from-blue-200 to-purple-200 p-4">

      <h1 className="text-3xl font-bold">AI 8-Puzzle Solver</h1>

      <Board board={board} />

      <Controls onSolve={handleSolve} />

      {loading && <p className="text-lg">Solving...</p>}

      {cost !== null && (
        <p className="text-xl font-semibold">Cost: {cost}</p>
      )}

      <StepViewer steps={steps} />

    </div>
  );
}
