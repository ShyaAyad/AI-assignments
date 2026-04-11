export default function TableModal({ n, r, result, table, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="absolute flex items-center justify-center w-8 h-8 rounded-full right-5 top-5 bg-slate-200 text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            Dynamic Programming Table
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-500">
            DP[I][J] = P(I, J) — ROWS: TOTAL BOOKS (N), COLUMNS: GROUP SIZE (R)
          </p>
        </div>

        {/* Table */}
        <div className="p-6 overflow-auto">
          <table className="w-full font-mono text-sm text-center border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-blue-900 bg-blue-300 rounded-tl-lg">
                  n \ r
                </th>
                {Array.from({ length: r + 1 }, (_, j) => (
                  <th
                    key={j}
                    className="px-4 py-3 text-sm font-bold text-blue-900 bg-blue-300 last:rounded-tr-lg"
                  >
                    {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => {
                const isEven = i % 2 === 0;
                return (
                  <tr key={i}>
                    {/* Row header */}
                    <td
                      className={`px-4 py-3 font-bold ${
                        isEven
                          ? "bg-blue-300 text-blue-900"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      n = {i}
                    </td>

                    {row.map((cell, j) => {
                      const isSolution = i === n && j === r;
                      return (
                        <td
                          key={j}
                          className={`px-4 py-3 transition-all ${
                            isSolution
                              ? "bg-yellow-400 font-bold text-yellow-900"
                              : isEven
                              ? "bg-slate-50 text-slate-700"
                              : "bg-white text-slate-600"
                          }`}
                        >
                          {isSolution ? (
                            <span className="text-base font-extrabold">
                              {cell.toLocaleString()}
                            </span>
                          ) : (
                            cell.toLocaleString()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 space-y-2 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm" />
            <span>
              Solution cell — P({n}, {r}) ={" "}
              <strong>{result.toLocaleString()}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="inline-block w-4 h-4 bg-blue-300 rounded-sm" />
            <span>Column / row headers</span>
          </div>
        </div>

      </div>
    </div>
  );
}
