// this component shows steps and control buttons (prev, play, next)
export default function StepViewer({ 
  steps,                  // array of all steps
  currentStepIndex,       // current step number
  setCurrentStepIndex,    // function to change step
  isPlaying,              // true or false (playing or paused)
  setIsPlaying            // function to change play state
}) {

  // if no steps, show nothing
  if (!steps) return null;

  // return what we show on screen
  return (

    // main box with style
    <div className="mt-4 p-6 bg-white rounded-xl shadow-lg text-center w-80">

      {/* show current step number */}
      <h2 className="text-xl font-bold mb-4">
        Step {currentStepIndex + 1} / {steps.length}
      </h2>
      
      {/* buttons container */}
      <div className="flex justify-center gap-3">

        {/* previous button */}
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"

          // go to previous step (not less than 0)
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
        >
          Prev
        </button>
        
        {/* play / pause button */}
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"

          // switch between play and pause
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {/* show text based on state */}
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        {/* next button */}
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"

          // go to next step (not more than last step)
          onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
        >
          Next
        </button>

      </div>
    </div>
  );
}
