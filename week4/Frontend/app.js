const API = "http://127.0.0.1:8000";

let board = [];
let initialBoard = [];
let jobId = null;
let polling = false;
let lastLoggedIndex = 0;
let allResults = [];
let selectedGenIndex = null;

// ─── LOAD BOARD ───────────────────────────────────────────────
async function loadBoard() {
  try {
    setStatus("Loading new board...");
    const res = await fetch(`${API}/board/new`);
    const data = await res.json();
    board = data.board;
    initialBoard = JSON.parse(JSON.stringify(board));
    resetUI();
    renderBoard();
    setStatus("Board ready. You can edit empty cells or start evolution.");
  } catch (err) {
    setStatus("❌ Could not connect to backend. Is uvicorn running?");
  }
}

// ─── RENDER BOARD ─────────────────────────────────────────────
function renderBoard(gaBoard = null) {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cellDiv = document.createElement("div");
      cellDiv.classList.add("cell");
      cellDiv.id = `cell-${r}-${c}`;

      if (c === 2 || c === 5) cellDiv.classList.add("border-right");
      if (r === 2 || r === 5) cellDiv.classList.add("border-bottom");

      const input = document.createElement("input");
      input.maxLength = 1;
      input.type = "text";

      const isFixed = initialBoard[r][c] !== 0;
      const gaVal = gaBoard ? gaBoard[r][c] : null;

      if (isFixed) {
        cellDiv.classList.add("fixed");
        input.value = initialBoard[r][c];
        input.disabled = true;
      } else if (gaVal) {
        input.value = gaVal;
        input.disabled = true;
        cellDiv.classList.add("ga-filled");
      } else {
        const currentVal = board[r][c];
        input.value = currentVal !== 0 ? currentVal : "";
        input.disabled = false;
        input.addEventListener("input", (e) =>
          handleInput(e, r, c, cellDiv, input)
        );
      }

      cellDiv.appendChild(input);
      boardDiv.appendChild(cellDiv);
    }
  }
}

// ─── HANDLE USER INPUT ────────────────────────────────────────
async function handleInput(e, r, c, cellDiv, input) {
  const raw = e.target.value.replace(/[^1-9]/g, "");
  input.value = raw;

  if (!raw) {
    board[r][c] = 0;
    cellDiv.classList.remove("invalid");
    return;
  }

  const val = parseInt(raw);
  board[r][c] = val;

  try {
    const res = await fetch(`${API}/check-cell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board, row: r, col: c, value: val }),
    });
    const data = await res.json();

    if (data.valid) {
      cellDiv.classList.remove("invalid");
    } else {
      cellDiv.classList.add("invalid");
    }
  } catch {
    // backend unreachable — skip validation
  }
}

// ─── RESET ────────────────────────────────────────────────────
function resetBoard() {
  board = JSON.parse(JSON.stringify(initialBoard));
  polling = false;
  jobId = null;
  resetUI();
  renderBoard();
  setStatus("Board reset.");
}

function resetUI() {
  document.getElementById("gen").innerText = "0";
  document.getElementById("fitness").innerText = "0";
  document.getElementById("job-status").innerText = "Ready";
  document.getElementById("log").innerHTML = "";
  lastLoggedIndex = 0;
  allResults = [];
  selectedGenIndex = null;
}

// ─── START GA ─────────────────────────────────────────────────
async function startSolve() {
  if (polling) return;

  try {
    setStatus("Submitting board to GA solver...");
    document.getElementById("job-status").innerText = "Starting...";

    const res = await fetch(`${API}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board }),
    });

    const data = await res.json();
    jobId = data.job_id;
    polling = true;

    document.getElementById("job-status").innerText = "Running";
    setStatus("Evolution running...");
    pollStatus();
  } catch (err) {
    setStatus("❌ Failed to start solver. Is the backend running?");
  }
}

// ─── POLL STATUS ──────────────────────────────────────────────
async function pollStatus() {
  if (!jobId || !polling) return;

  try {
    const res = await fetch(`${API}/status/${jobId}`);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const last = data.results[data.results.length - 1];

      document.getElementById("gen").innerText = last.generation;
      document.getElementById("fitness").innerText = last.fitness;

      if (selectedGenIndex === null) {
        renderBoard(last.board);
      }

      logGenerations(data.results);
    }

    if (data.status === "running") {
      setTimeout(pollStatus, 100);
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

// ─── SELECT GENERATION ────────────────────────────────────────
function selectGeneration(index) {
  selectedGenIndex = index;
  const result = allResults[index];
  if (!result) return;

  renderBoard(result.board);
  document.getElementById("gen").innerText = result.generation;
  document.getElementById("fitness").innerText = result.fitness;

  document.querySelectorAll(".log-entry").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });

  const label = result.fitness === 243
    ? `Viewing gen ${result.generation} — solved!`
    : `Viewing gen ${result.generation} (fitness ${result.fitness})`;
  setStatus(label);
}

// ─── LOG ──────────────────────────────────────────────────────
function logGenerations(results) {
  const log = document.getElementById("log");
  const newResults = results.slice(lastLoggedIndex);

  newResults.forEach((r, offsetIndex) => {
    const globalIndex = lastLoggedIndex + offsetIndex;
    allResults.push(r);

    const div = document.createElement("div");
    div.classList.add("log-entry");
    div.title = "Click to view this generation's board";
    div.addEventListener("click", () => selectGeneration(globalIndex));

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
    log.scrollTop = log.scrollHeight;
  });

  lastLoggedIndex = results.length;
}

// ─── HELPERS ──────────────────────────────────────────────────
function setStatus(msg) {
  document.getElementById("status-msg").innerText = msg;
}

// ─── INIT ─────────────────────────────────────────────────────
loadBoard();