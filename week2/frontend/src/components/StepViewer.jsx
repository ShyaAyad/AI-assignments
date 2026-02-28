export default function StepViewer({ 
  steps, 
  currentStepIndex, 
  setCurrentStepIndex, 
  isPlaying, 
  setIsPlaying 
}) {
  if (!steps) return null;

  return (
    <div className="mt-4 p-6 bg-white rounded-xl shadow-lg text-center w-80">
      <h2 className="text-xl font-bold mb-4">
        Step {currentStepIndex + 1} / {steps.length}
      </h2>
      
      <div className="flex justify-center gap-3">
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
        >Prev</button>
        
        <button 
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setCurrentStepIndex(Math.min(steps.length - 1, currentStepIndex + 1))}
        >Next</button>
      </div>
    </div>
  );
}
