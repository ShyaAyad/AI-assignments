// Backend API URL (FastAPI / uvicorn server)
const API = "http://127.0.0.1:8000";

// Main board (current working Sudoku)
let board = [];

// Copy of the original puzzle (fixed cells)
let initialBoard = [];

// ID of the running genetic algorithm job
let jobId = null;

// Flag to check if polling (checking backend repeatedly) is active
let polling = false;

// Index to track how many generations we already logged
let lastLoggedIndex = 0;

// Stores all generations returned from backend
let allResults = [];

// Currently selected generation (for viewing old states)
let selectedGenIndex = null;


// ─── LOAD BOARD ───────────────────────────────────────────────
async function loadBoard() {
  try {
    setStatus("Loading new board..."); // Show loading message

    const res = await fetch(`${API}/board/new`); // Request new puzzle
    const data = await res.json(); // Convert response to JSON

    board = data.board; // Store board
    initialBoard = JSON.parse(JSON.stringify(board)); 
    // Deep copy to preserve original puzzle

    resetUI(); // Reset UI elements
    renderBoard(); // Draw board on screen

    setStatus("Board ready. You can edit empty cells or start evolution.");
  } catch (err) {
    setStatus("❌ Could not connect to backend. Is uvicorn running?");
  }
}


// ─── RENDER BOARD ─────────────────────────────────────────────
function renderBoard(gaBoard = null) {
  const boardDiv = document.getElementById("board"); // Get board container
  boardDiv.innerHTML = ""; // Clear previous board

  // Loop rows
  for (let r = 0; r < 9; r++) {

    // Loop columns
    for (let c = 0; c < 9; c++) {

      const cellDiv = document.createElement("div"); // Create cell
      cellDiv.classList.add("cell"); // Add CSS class
      cellDiv.id = `cell-${r}-${c}`; // Unique ID

      // Add thick borders for 3x3 blocks
      if (c === 2 || c === 5) cellDiv.classList.add("border-right");
      if (r === 2 || r === 5) cellDiv.classList.add("border-bottom");

      const input = document.createElement("input"); // Input field
      input.maxLength = 1; // Only 1 digit
      input.type = "text";

      const isFixed = initialBoard[r][c] !== 0; // Check if original cell
      const gaVal = gaBoard ? gaBoard[r][c] : null; // GA value if exists

      if (isFixed) {
        // Original puzzle cell
        cellDiv.classList.add("fixed");
        input.value = initialBoard[r][c];
        input.disabled = true; // Not editable

      } else if (gaVal) {
        // Filled by genetic algorithm
        input.value = gaVal;
        input.disabled = true;
        cellDiv.classList.add("ga-filled");

      } else {
        // Editable user cell
        const currentVal = board[r][c];
        input.value = currentVal !== 0 ? currentVal : "";
        input.disabled = false;

        // Listen to user input
        input.addEventListener("input", (e) =>
          handleInput(e, r, c, cellDiv, input)
        );
      }

      cellDiv.appendChild(input); // Add input to cell
      boardDiv.appendChild(cellDiv); // Add cell to board
    }
  }
}


// ─── HANDLE USER INPUT ────────────────────────────────────────
async function handleInput(e, r, c, cellDiv, input) {

  // Remove anything except numbers 1-9
  const raw = e.target.value.replace(/[^1-9]/g, "");
  input.value = raw;

  // If empty → reset cell
  if (!raw) {
    board[r][c] = 0;
    cellDiv.classList.remove("invalid");
    return;
  }

  const val = parseInt(raw); // Convert to number
  board[r][c] = val; // Update board

  try {
    // Send value to backend for validation
    const res = await fetch(`${API}/check-cell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, row: r, col: c, value: val }),
    });

    const data = await res.json();

    if (data.valid) {
      cellDiv.classList.remove("invalid"); // Valid input
    } else {
      cellDiv.classList.add("invalid"); // Highlight error
    }

  } catch {
    // If backend is not reachable → skip validation
  }
}


// ─── RESET ────────────────────────────────────────────────────
function resetBoard() {
  board = JSON.parse(JSON.stringify(initialBoard)); // Restore original
  polling = false; // Stop polling
  jobId = null; // Clear job

  resetUI(); // Reset UI
  renderBoard(); // Re-render board

  setStatus("Board reset.");
}


// Reset UI elements (stats + logs)
function resetUI() {
  document.getElementById("gen").innerText = "0";
  document.getElementById("fitness").innerText = "0";
  document.getElementById("job-status").innerText = "Ready";
  document.getElementById("log").innerHTML = "";

  lastLoggedIndex = 0;
  allResults = [];
  selectedGenIndex = null;
}


// ─── START GENETIC ALGORITHM ─────────────────────────────────
async function startSolve() {
  if (polling) return; // Prevent double start

  try {
    setStatus("Submitting board to GA solver...");
    document.getElementById("job-status").innerText = "Starting...";

    // Send board to backend
    const res = await fetch(`${API}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
    });

    const data = await res.json();
    jobId = data.job_id; // Save job ID
    polling = true; // Start polling

    document.getElementById("job-status").innerText = "Running";
    setStatus("Evolution running...");

    pollStatus(); // Start checking progress

  } catch (err) {
    setStatus("❌ Failed to start solver. Is the backend running?");
  }
}


// ─── POLL BACKEND FOR STATUS ─────────────────────────────────
async function pollStatus() {
  if (!jobId || !polling) return;

  try {
    const res = await fetch(`${API}/status/${jobId}`);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const last = data.results[data.results.length - 1];

      // Update UI stats
      document.getElementById("gen").innerText = last.generation;
      document.getElementById("fitness").innerText = last.fitness;

      // Only auto-render if user isn't viewing old generation
      if (selectedGenIndex === null) {
        renderBoard(last.board);
      }

      logGenerations(data.results); // Update log
    }

    if (data.status === "running") {
      setTimeout(pollStatus, 100); // Keep polling every 100ms

    } else if (data.status === "done") {
      polling = false;

      const last = data.results[data.results.length - 1];

      if (last && last.fitness === 243) {
        document.getElementById("job-status").innerText = "✅ Solved!";
        setStatus("✅ Puzzle solved by the genetic algorithm!");
      } else {
        document.getElementById("job-status").innerText = "Finished";
        setStatus("Evolution finished. Best solution shown.");
      }

      selectedGenIndex = null;

      if (last) renderBoard(last.board);

    } else if (data.status === "error") {
      polling = false;
      document.getElementById("job-status").innerText = "Error";
      setStatus("❌ Error: " + (data.error || "Unknown error"));
    }

  } catch (err) {
    polling = false;
    setStatus("❌ Lost connection to backend.");
  }
}


// ─── SELECT OLD GENERATION ───────────────────────────────────
function selectGeneration(index) {
  selectedGenIndex = index;

  const result = allResults[index];
  if (!result) return;

  renderBoard(result.board);

  document.getElementById("gen").innerText = result.generation;
  document.getElementById("fitness").innerText = result.fitness;

  // Highlight selected log entry
  document.querySelectorAll(".log-entry").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  const label = result.fitness === 243
    ? `Viewing gen ${result.generation} — solved!`
    : `Viewing gen ${result.generation} (fitness ${result.fitness})`;

  setStatus(label);
}


// ─── LOG GENERATIONS ─────────────────────────────────────────
function logGenerations(results) {
  const log = document.getElementById("log");

  // Only process new generations
  const newResults = results.slice(lastLoggedIndex);

  newResults.forEach((r, offsetIndex) => {
    const globalIndex = lastLoggedIndex + offsetIndex;

    allResults.push(r); // Save result

    const div = document.createElement("div");
    div.classList.add("log-entry");

    div.title = "Click to view this generation's board";

    div.addEventListener("click", () => selectGeneration(globalIndex));

    // Styling based on fitness
    if (r.fitness === 243) {
      div.classList.add("solved");
      div.innerHTML = `<span>Gen ${r.generation}</span><span>🏆 243 SOLVED</span>`;
    } else if (r.fitness >= 230) {
      div.classList.add("best");
      div.innerHTML = `<span>Gen ${r.generation}</span><span>${r.fitness}</span>`;
    } else {
      div.innerHTML = `<span>Gen ${r.generation}</span><span>${r.fitness}</span>`;
    }

    log.appendChild(div);

    // Auto scroll to bottom
    log.scrollTop = log.scrollHeight;
  });

  lastLoggedIndex = results.length; // Update index
}


// ─── HELPER FUNCTION ─────────────────────────────────────────
function setStatus(msg) {
  document.getElementById("status-msg").innerText = msg;
}


// ─── INITIAL LOAD ────────────────────────────────────────────
loadBoard(); // Load a Sudoku board when page opens
