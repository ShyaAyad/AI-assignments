export default function StepViewer({ steps }) {
  if (!steps) return null;

  return (
    <div className="mt-4 p-2 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Steps: {steps.length}</h2>
      <div className="flex flex-wrap gap-2">
        {steps.map((step, i) => (
          <div key={i} className="p-2 bg-gray-200 rounded">
            {step.flat().join(" ")}
          </div>
        ))}
      </div>
    </div>
  );
}