// import Tile component from another file
import Tile from "./Tile"; 

// this is the main Board component
export default function Board({ board }) {

  // check if board exists and is an array
  // if not, show "Loading..."
  if (!board || !Array.isArray(board)) {
    return <div>Loading...</div>;
  }

  // return the UI (what we show on screen)
  return (

    // this div makes a 3x3 grid with some spacing and style
    <div className="grid grid-cols-3 gap-3 p-4 bg-gray-100 rounded-xl">

      {/* loop through each row in the board */}
      {board.map((row, rowIndex) =>

        // loop through each number in the row
        row.map((num, colIndex) => (

          // show a Tile for each number
          // key is used to make React happy (unique id)
          <Tile key={`${rowIndex}-${colIndex}`} value={num} />
        ))
      )}

    </div>
  );
}
