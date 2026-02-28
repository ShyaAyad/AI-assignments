import Tile from "./Tile"; // 

export default function Board({ board }) {
  // Check if board data is valid before mapping
  if (!board || !Array.isArray(board)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-gray-100 rounded-xl">
      {board.map((row, rowIndex) =>
        row.map((num, colIndex) => (
          <Tile key={`${rowIndex}-${colIndex}`} value={num} />
        ))
      )}
    </div>
  );
}