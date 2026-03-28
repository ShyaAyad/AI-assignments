// this is the Controls component
// it takes a function called onSolve as input
export default function Controls({ onSolve }) {

  // return what we show on screen
  return (

    // this is a button
    <button

      // when user clicks the button, run onSolve function
      onClick={onSolve}

      // these are styles (design of the button)
      className="
        px-6 py-2        // padding (space inside button)
        bg-green-500     // green background
        text-white       // white text
        rounded-lg       // rounded corners
        hover:bg-green-600 // darker green when mouse is over it
      "
    >

      {/* text inside the button */}
      Solve Puzzle

    </button>
  );
}
}
