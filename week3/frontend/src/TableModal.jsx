// This is a React component called TableModal
// It takes props: n, r, result, table, onClose
export default function TableModal({ n, r, result, table, onClose }) {

  return (
    // This is the dark background (overlay) behind the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose} // if user clicks outside, close modal
    >

      {/* This is the main modal box */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()} // stop closing when clicking inside
      >

        {/* ===== Modal Header ===== */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">

          {/* Close button (X) */}
          <button
            onClick={onClose} // close modal when clicked
            className="absolute flex items-center justify-center w-8 h-8 rounded-full right-5 top-5 bg-slate-200 text-slate-600 hover:bg-slate-300"
          >
            ✕
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900">
            Dynamic Programming Table
          </h2>

          {/* Small description text */}
          <p className="mt-1 font-mono text-xs text-slate-500">
            DP[I][J] = P(I, J) — ROWS: TOTAL BOOKS (N), COLUMNS: GROUP SIZE (R)
          </p>
        </div>

        {/* ===== Table Section ===== */}
        <div className="p-6 overflow-auto">

          {/* Table */}
          <table className="w-full font-mono text-sm text-center border-collapse">

            {/* Table header */}
            <thead>
              <tr>

                {/* Top-left cell */}
                <th className="px-4 py-3 text-xs font-semibold text-blue-900 bg-blue-300 rounded-tl-lg">
                  n \ r
                </th>

                {/* Create columns from 0 to r */}
                {Array.from({ length: r + 1 }, (_, j) => (
                  <th
                    key={j} // unique key for React
                    className="px-4 py-3 text-sm font-bold text-blue-900 bg-blue-300 last:rounded-tr-lg"
                  >
                    {j} {/* show column number */}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table body */}
            <tbody>

              {/* Loop through each row in table */}
              {table.map((row, i) => {

                const isEven = i % 2 === 0; // check if row index is even

                return (
                  <tr key={i}>

                    {/* Row header (n value) */}
                    <td
                      className={`px-4 py-3 font-bold ${
                        isEven
                          ? "bg-blue-300 text-blue-900" // even row color
                          : "bg-blue-100 text-blue-800" // odd row color
                      }`}
                    >
                      n = {i} {/* show row number */}
                    </td>

                    {/* Loop through each cell in the row */}
                    {row.map((cell, j) => {

                      // Check if this cell is the final solution
                      const isSolution = i === n && j === r;

                      return (
                        <td
                          key={j}
                          className={`px-4 py-3 transition-all ${
                            isSolution
                              ? "bg-yellow-400 font-bold text-yellow-900" // highlight result
                              : isEven
                              ? "bg-slate-50 text-slate-700" // even row
                              : "bg-white text-slate-600" // odd row
                          }`}
                        >

                          {/* If it's the solution cell */}
                          {isSolution ? (
                            <span className="text-base font-extrabold">
                              {cell.toLocaleString()} {/* show result big */}
                            </span>
                          ) : (
                            cell.toLocaleString() // normal cell
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

        {/* ===== Legend Section ===== */}
        <div className="px-6 py-4 space-y-2 border-t border-slate-200 bg-slate-50">

          {/* Yellow box explanation */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="inline-block w-4 h-4 bg-yellow-400 rounded-sm" />
            <span>
              Solution cell — P({n}, {r}) ={" "}
              <strong>{result.toLocaleString()}</strong>
            </span>
          </div>

          {/* Blue box explanation */}
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="inline-block w-4 h-4 bg-blue-300 rounded-sm" />
            <span>Column / row headers</span>
          </div>

        </div>

      </div>
    </div>
  );
}
