export default function Controls({ onSolve }) {
  return (
    <button
      onClick={onSolve}
      className="
        px-6 py-2
        bg-green-500
        text-white
        rounded-lg
        hover:bg-green-600
      "
    >
      Solve Puzzle
    </button>
  );
}