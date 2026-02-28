import Tile from "./Tile";

export default function Board({ board }) {
  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-gray-100 rounded-xl">
      {board.flat().map((num, index) => (
        <Tile key={index} value={num} />
      ))}
    </div>
  );
}