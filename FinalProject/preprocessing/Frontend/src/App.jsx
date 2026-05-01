import { useState } from "react";

export default function App() {
  const [features, setFeatures] = useState(Array(21).fill(0));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    const updated = [...features];
    updated[index] = Number(value);
    setFeatures(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ features })
      });

      const data = await response.json();
      setResult(data.prediction);
    } catch (error) {
      console.error("Error:", error);
      alert("Backend connection failed");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Student Anxiety Predictor</h1>

      <div style={styles.grid}>
        {features.map((val, i) => (
          <input
            key={i}
            type="number"
            value={val}
            onChange={(e) => handleChange(i, e.target.value)}
            style={styles.input}
            placeholder={`Feature ${i + 1}`}
          />
        ))}
      </div>

      <button onClick={handleSubmit} style={styles.button}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result !== null && (
        <div style={styles.result}>
          Prediction: <strong>{result}</strong>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "10px",
    marginBottom: "20px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #444",
    background: "#1a1d27",
    color: "#fff"
  },
  button: {
    padding: "12px 30px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer"
  },
  result: {
    marginTop: "20px",
    fontSize: "18px"
  }
};