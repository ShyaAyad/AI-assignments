import axios from "axios";

// Backend URL (your Member 2 backend)
const API_URL = "http://localhost:8000";

export const solvePuzzle = async (board) => {
  const response = await axios.post(`${API_URL}/solve`, { board });
  return response.data;  // expects { cost: number, steps: array }
};