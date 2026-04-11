//npm install axios

import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const solvePermutation = async (n, r) => {
    const response = await axios.post(`${API_URL}/solve`, {
        n: n,
        r: r,
    });

    return response.data;
};