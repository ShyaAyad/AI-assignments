import { useState } from "react";

const API_URL = "http://127.0.0.1:8000/solve";

export default function BookArrangementCalculator() {
  const [n, setN] = useState("");
  const [r, setR] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [table, setTable] = useState(null);

  async function calculateArrangement(event) {
    event.preventDefault();

    const totalBooks = Number(n);
    const groupSize = Number(r);

    if (
      !Number.isInteger(totalBooks) ||
      !Number.isInteger(groupSize) ||
      totalBooks < 0 ||
      groupSize < 0
    ) {
      setError("Please enter valid whole numbers for n and r.");
      return;
    }

    if (groupSize > totalBooks) {
      setError("Group Size (r) cannot be greater than Total Books (n).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          n: totalBooks,
          r: groupSize,
        }),
      });

      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload.error || "Failed to calculate book arrangements.");
      }

      setResult(payload.result);
      setTable(payload.table);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_22%)] px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
          <div className="border-b border-slate-200 bg-slate-50/80 px-8 py-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Dynamic Programming
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
              Book Arrangement Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Enter the total number of books and the group size to calculate
              the arrangement count.
            </p>
          </div>

          <div className="space-y-8 px-8 py-8">
            <form onSubmit={calculateArrangement} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Total Books (n)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={n}
                    onChange={(event) => setN(event.target.value)}
                    placeholder="Enter total books"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Group Size (r)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={r}
                    onChange={(event) => setR(event.target.value)}
                    placeholder="Enter group size"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Calculating..." : "Calculate Arrangement"}
                </button>
              </div>
            </form>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            {result !== null && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-lg font-semibold text-emerald-700">
                Result: {result}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

