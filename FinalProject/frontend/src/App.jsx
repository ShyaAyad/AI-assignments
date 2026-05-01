import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ScatterController
} from 'chart.js'
import { Scatter, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ScatterController
)

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000'

// ─── Feature definitions (must match backend FEATURE_COLUMNS order) ───────────
const FEATURES = [
  { key: 'sleep_quality',               label: 'Sleep Quality',                min: 0, max: 5  },
  { key: 'headache',                    label: 'Headache',                     min: 0, max: 9  },
  { key: 'blood_pressure',              label: 'Blood Pressure',               min: 1, max: 3  },
  { key: 'breathing_problem',           label: 'Breathing Problem',            min: 0, max: 5  },
  { key: 'noise_level',                 label: 'Noise Level',                  min: 0, max: 5  },
  { key: 'living_conditions',           label: 'Living Conditions',            min: 0, max: 5  },
  { key: 'safety',                      label: 'Safety',                       min: 0, max: 5  },
  { key: 'basic_needs',                 label: 'Basic Needs',                  min: 0, max: 5  },
  { key: 'academic_performance',        label: 'Academic Performance',         min: 0, max: 5  },
  { key: 'study_load',                  label: 'Study Load',                   min: 0, max: 5  },
  { key: 'teacher_student_relationship',label: 'Teacher-Student Relation',     min: 0, max: 5  },
  { key: 'future_career_concerns',      label: 'Future Career Concerns',       min: 0, max: 5  },
  { key: 'social_support',              label: 'Social Support',               min: 0, max: 3  },
  { key: 'peer_pressure',               label: 'Peer Pressure',                min: 0, max: 5  },
  { key: 'extracurricular_activities',  label: 'Extracurricular Activities',   min: 0, max: 5  },
  { key: 'bullying',                    label: 'Bullying',                     min: 0, max: 5  },
  { key: 'self_esteem',                 label: 'Self Esteem',                  min: 0, max: 30 },
  { key: 'mental_health_history',       label: 'Mental Health History',        min: 0, max: 1  },
  { key: 'depression',                  label: 'Depression',                   min: 0, max: 5  },
  { key: 'stress_level',               label: 'Stress Level',                 min: 0, max: 2  },
]

const MODEL_COLORS = {
  lr:  '#5b8dee',
  svm: '#f07048',
  nn:  '#34c989',
}

// ─── Static training metrics loaded from backend prediction CSVs ──────────────
// These are filled once via the /metrics endpoint (or computed from test CSVs).
// We store them in state and fetch on mount.

function clamp(v, lo = 0, hi = 21) { return Math.max(lo, Math.min(hi, v)) }

// ─── Styles (identical to original) ──────────────────────────────────────────
const S = {
  app: {
    minHeight: '100vh',
    background: '#0f1117',
    color: '#e2e8f0',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    width: 260,
    background: '#13151f',
    borderRight: '1px solid #1e2235',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflowY: 'auto',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '28px 32px',
  },
  card: {
    background: '#13151f',
    border: '1px solid #1e2235',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#8892a4',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tab: active => ({
    padding: '10px 20px',
    background: active ? '#1e2235' : 'transparent',
    border: 'none',
    borderLeft: active ? '2px solid #5b8dee' : '2px solid transparent',
    color: active ? '#e2e8f0' : '#5a6478',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: active ? 500 : 400,
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s',
  }),
  metricCard: (accent) => ({
    background: '#0f1117',
    border: `1px solid ${accent}33`,
    borderRadius: 10,
    padding: '14px 16px',
    flex: 1,
  }),
  badge: (level) => {
    const map = {
      low:      { bg: '#0d2e1a', color: '#34c989', border: '#1a4d2e' },
      moderate: { bg: '#2e1e0a', color: '#f0a848', border: '#4d330f' },
      high:     { bg: '#2e0d0d', color: '#f07048', border: '#4d1a1a' },
    }
    const s = map[level] || map.moderate
    return {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
    }
  },
  sliderLabel: {
    fontSize: 12,
    color: '#8892a4',
    minWidth: 190,
    flexShrink: 0,
  },
  sliderVal: {
    fontSize: 12,
    fontWeight: 500,
    color: '#e2e8f0',
    width: 28,
    textAlign: 'right',
    fontFamily: "'DM Mono', monospace",
  },
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState('predict')
  const [apiOnline, setApiOnline] = useState(false)
  const [status, setStatus]     = useState('Connecting to API…')

  const [inputs, setInputs] = useState(() => {
    const obj = {}
    FEATURES.forEach(f => { obj[f.key] = Math.round((f.min + f.max) / 2) })
    return obj
  })

  const [prediction, setPrediction] = useState(null)
  const [predLoading, setPredLoading] = useState(false)

  // Metrics fetched from backend (via separate /metrics endpoint or defaults)
  const [metrics, setMetrics]   = useState(null)
  // Scatter test-set data fetched from backend
  const [testData, setTestData] = useState(null)
  // Feature importance fetched from backend
  const [fi, setFI]             = useState(null)

  // ── On mount: check API, then fetch static data ─────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`${API_BASE}/`)
        if (!res.ok) throw new Error()
        setApiOnline(true)
        setStatus('API connected — models ready')
      } catch {
        setApiOnline(false)
        setStatus('Cannot reach API at localhost:8000 — start api.py')
        return
      }

      // Fetch feature list to confirm column alignment
      try {
        const r = await fetch(`${API_BASE}/features`)
        const d = await r.json()
        console.log('Backend features:', d.features)
      } catch { /* non-fatal */ }

      // Fetch metrics (our custom endpoint)
      try {
        const r = await fetch(`${API_BASE}/metrics`)
        if (r.ok) {
          const d = await r.json()
          setMetrics(d)   // { lr:{mae,rmse,r2}, svm:{...}, nn:{...} }
        }
      } catch { /* endpoint may not exist yet — handled in CompareTab */ }

      // Fetch test-set scatter data
      try {
        const r = await fetch(`${API_BASE}/test_predictions`)
        if (r.ok) {
          const d = await r.json()
          setTestData(d)  // { lr:{actual:[],predicted:[]}, svm:{...}, nn:{...} }
        }
      } catch { /* handled in CompareTab */ }

      // Fetch feature importance
      try {
        const r = await fetch(`${API_BASE}/feature_importance`)
        if (r.ok) {
          const d = await r.json()
          setFI(d)        // { lr:[...], svm:[...], nn:[...] }  — 20 values each
        }
      } catch { /* handled in FeaturesTab */ }
    }
    init()
  }, [])

  // ── Predict whenever inputs change (debounced 300 ms) ──────────────────────
  const debounceRef = useRef(null)
  const runPrediction = useCallback(async (inp) => {
    if (!apiOnline) return
    setPredLoading(true)
    try {
      const res = await fetch(`${API_BASE}/predict/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inp),
      })
      if (!res.ok) throw new Error('Prediction failed')
      const d = await res.json()
      const lr  = clamp(d.predictions['Linear Regression'])
      const svm = clamp(d.predictions['SVM Regression'])
      const nn  = clamp(d.predictions['Neural Network'])
      setPrediction({ lr, svm, nn, avg: (lr + svm + nn) / 3 })
    } catch (e) {
      console.error(e)
    } finally {
      setPredLoading(false)
    }
  }, [apiOnline])

  useEffect(() => {
    if (!apiOnline) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runPrediction(inputs), 300)
    return () => clearTimeout(debounceRef.current)
  }, [inputs, apiOnline, runPrediction])

  const setInput = (key, val) => setInputs(prev => ({ ...prev, [key]: parseFloat(val) }))

  const randomize = () => {
    const obj = {}
    FEATURES.forEach(f => { obj[f.key] = Math.round(f.min + Math.random() * (f.max - f.min)) })
    setInputs(obj)
  }

  const severityLevel = avg =>
    avg == null ? 'moderate' : avg <= 7 ? 'low' : avg <= 14 ? 'moderate' : 'high'
  const severityLabel = avg =>
    avg == null ? '—' : avg <= 7 ? 'Low Anxiety' : avg <= 14 ? 'Moderate Anxiety' : 'High Anxiety'

  const TABS = [
    { key: 'predict', label: 'Predict' },
    { key: 'compare', label: 'Model Comparison' },
    { key: 'features', label: 'Feature Analysis' },
  ]

  return (
    <div style={{ ...S.app, display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ── */}
      <div style={{
        background: '#13151f', borderBottom: '1px solid #1e2235',
        padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: apiOnline ? '#34c989' : '#f07048',
          animation: apiOnline ? 'none' : 'pulse 1.2s infinite',
        }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0' }}>
            Student Anxiety Level Predictor
          </div>
          <div style={{ fontSize: 12, color: '#5a6478' }}>{status}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['lr', 'svm', 'nn'].map(k => (
            <span key={k} style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 6,
              background: MODEL_COLORS[k] + '22',
              color: MODEL_COLORS[k],
              border: `1px solid ${MODEL_COLORS[k]}44`,
            }}>
              {{ lr: 'Linear Regression', svm: 'SVM', nn: 'Neural Network' }[k]}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* ── Sidebar ── */}
        <div style={S.sidebar}>
          <div style={{
            padding: '0 20px 16px', fontSize: 11, color: '#3a4256',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>Navigation</div>
          {TABS.map(t => (
            <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid #1e2235' }}>
            <div style={{ fontSize: 11, color: '#3a4256', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Backend</div>
            <div style={{ fontSize: 12, color: '#5a6478', lineHeight: 1.6 }}>
              Flask API · localhost:8000<br />
              sklearn · MLPRegressor<br />
              Target: anxiety_level (0–21)
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={S.main}>
          {tab === 'predict' && (
            <PredictTab
              inputs={inputs}
              setInput={setInput}
              randomize={randomize}
              prediction={prediction}
              predLoading={predLoading}
              apiOnline={apiOnline}
              severityLevel={severityLevel}
              severityLabel={severityLabel}
            />
          )}
          {tab === 'compare' && (
            <CompareTab metrics={metrics} testData={testData} apiOnline={apiOnline} />
          )}
          {tab === 'features' && (
            <FeaturesTab fi={fi} apiOnline={apiOnline} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input[type=range] { width:100%; accent-color:#5b8dee; cursor:pointer; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

// ─── Predict Tab ──────────────────────────────────────────────────────────────
function PredictTab({ inputs, setInput, randomize, prediction, predLoading, apiOnline, severityLevel, severityLabel }) {
  const avg   = prediction?.avg
  const level = severityLevel(avg)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* ── Sliders ── */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={S.cardTitle}>Feature Inputs ({FEATURES.length} features)</div>
            <button
              onClick={randomize}
              style={{
                fontSize: 12, padding: '6px 14px',
                background: '#1e2235', border: '1px solid #2a3047',
                borderRadius: 8, color: '#8892a4', cursor: 'pointer',
              }}
            >
              Randomize
            </button>
          </div>

          {FEATURES.map(f => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={S.sliderLabel}>{f.label}</span>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={1}
                value={inputs[f.key]}
                onChange={e => setInput(f.key, e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={S.sliderVal}>{inputs[f.key]}</span>
            </div>
          ))}

          {!apiOnline && (
            <div style={{
              marginTop: 16, padding: '10px 14px',
              background: '#2e0d0d', border: '1px solid #4d1a1a',
              borderRadius: 8, fontSize: 13, color: '#f07048',
            }}>
              ⚠ API offline — start <code style={{ fontFamily: "'DM Mono', monospace" }}>python api.py</code> and refresh.
            </div>
          )}
        </div>

        {/* ── Result panel ── */}
        <div>
          <div style={{ ...S.card, textAlign: 'center', padding: '28px 20px' }}>
            <div style={{
              fontSize: 11, color: '#5a6478', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Ensemble Prediction
            </div>

            <div style={{
              fontSize: 72, fontWeight: 600, lineHeight: 1, marginBottom: 12,
              color: predLoading ? '#3a4256' : level === 'low' ? '#34c989' : level === 'high' ? '#f07048' : '#f0a848',
              fontFamily: "'DM Mono', monospace",
              transition: 'color 0.3s',
            }}>
              {predLoading ? '…' : avg != null ? avg.toFixed(1) : '—'}
            </div>

            <div style={{ fontSize: 13, color: '#5a6478', marginBottom: 14 }}>out of 21</div>

            {avg != null && !predLoading && (
              <span style={S.badge(level)}>{severityLabel(avg)}</span>
            )}

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['lr', 'Linear Regression'], ['svm', 'SVM'], ['nn', 'Neural Network']].map(([k, name]) => (
                <div key={k} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#0f1117', borderRadius: 8,
                  border: `1px solid ${MODEL_COLORS[k]}33`,
                }}>
                  <span style={{ fontSize: 12, color: MODEL_COLORS[k] }}>{name}</span>
                  <span style={{
                    fontSize: 16, fontWeight: 600, color: '#e2e8f0',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {predLoading ? '…' : prediction ? prediction[k].toFixed(1) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...S.card, padding: '14px 18px' }}>
            <div style={S.cardTitle}>Severity Bands (GAD-7)</div>
            {[['low', '0 – 7', '#34c989'], ['moderate', '8 – 14', '#f0a848'], ['high', '15 – 21', '#f07048']].map(([l, range, col]) => (
              <div key={l} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 8, padding: '6px 10px',
                background: level === l && avg != null ? col + '15' : 'transparent',
                borderRadius: 6,
                border: level === l && avg != null ? `1px solid ${col}44` : '1px solid transparent',
              }}>
                <span style={{
                  fontSize: 12,
                  color: level === l && avg != null ? col : '#5a6478',
                  textTransform: 'capitalize',
                }}>{l}</span>
                <span style={{ fontSize: 11, color: '#3a4256', fontFamily: "'DM Mono', monospace" }}>{range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────
function CompareTab({ metrics, testData, apiOnline }) {
  const [activeScatter, setActiveScatter] = useState('lr')

  if (!apiOnline) {
    return (
      <div style={{ color: '#5a6478', padding: 40, textAlign: 'center' }}>
        API is offline. Start <code style={{ color: '#f07048' }}>python api.py</code> and refresh.
      </div>
    )
  }

  // While waiting for metrics/testData to load
  if (!metrics || !testData) {
    return (
      <div style={{ ...S.card, color: '#5a6478', padding: 40, textAlign: 'center' }}>
        <div style={{ marginBottom: 12, fontSize: 14 }}>Loading model metrics…</div>
        <div style={{ fontSize: 12 }}>
          Make sure <code style={{ color: '#5b8dee', fontFamily: "'DM Mono', monospace" }}>/metrics</code> and{' '}
          <code style={{ color: '#5b8dee', fontFamily: "'DM Mono', monospace" }}>/test_predictions</code> endpoints
          are added to <code style={{ color: '#5b8dee', fontFamily: "'DM Mono', monospace" }}>api.py</code>.
          See the README for instructions.
        </div>
      </div>
    )
  }

  const modelList = [
    { key: 'lr',  name: 'Linear Regression' },
    { key: 'svm', name: 'SVM Regression' },
    { key: 'nn',  name: 'Neural Network' },
  ]

  const bestR2   = Math.max(...modelList.map(m => metrics[m.key].r2))
  const bestMAE  = Math.min(...modelList.map(m => metrics[m.key].mae))
  const bestRMSE = Math.min(...modelList.map(m => metrics[m.key].rmse))
  const bestModel = modelList.find(m => metrics[m.key].r2 === bestR2)

  // Scatter chart
  const scatterData = {
    datasets: [
      {
        label: 'Predictions',
        data: testData[activeScatter].actual.map((a, i) => ({
          x: a,
          y: parseFloat(clamp(testData[activeScatter].predicted[i]).toFixed(2)),
        })),
        backgroundColor: MODEL_COLORS[activeScatter] + 'aa',
        pointRadius: 5,
      },
      {
        label: 'Perfect fit',
        data: [{ x: 0, y: 0 }, { x: 21, y: 21 }],
        type: 'line',
        borderColor: '#ffffff22',
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    ],
  }
  const scatterOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        title: { display: true, text: 'Actual anxiety level', color: '#5a6478' },
        min: 0, max: 21,
        grid: { color: '#1e2235' }, ticks: { color: '#5a6478' },
      },
      y: {
        title: { display: true, text: 'Predicted', color: '#5a6478' },
        min: 0, max: 21,
        grid: { color: '#1e2235' }, ticks: { color: '#5a6478' },
      },
    },
  }

  // Bar chart
  const barData = {
    labels: ['Linear Regression', 'SVM', 'Neural Network'],
    datasets: [
      {
        label: 'MAE',
        data: modelList.map(m => parseFloat(metrics[m.key].mae.toFixed(3))),
        backgroundColor: modelList.map(m => MODEL_COLORS[m.key] + 'cc'),
      },
      {
        label: 'RMSE',
        data: modelList.map(m => parseFloat(metrics[m.key].rmse.toFixed(3))),
        backgroundColor: modelList.map(m => MODEL_COLORS[m.key] + '55'),
      },
    ],
  }
  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#8892a4', boxWidth: 10 } } },
    scales: {
      x: { grid: { color: '#1e2235' }, ticks: { color: '#5a6478' } },
      y: {
        grid: { color: '#1e2235' }, ticks: { color: '#5a6478' },
        title: { display: true, text: 'Error', color: '#5a6478' },
      },
    },
  }

  return (
    <div>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {modelList.map(m => (
          <div key={m.key} style={S.metricCard(MODEL_COLORS[m.key])}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: MODEL_COLORS[m.key], display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#8892a4' }}>{m.name}</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['R²', 'r2', bestR2, true], ['MAE', 'mae', bestMAE, false], ['RMSE', 'rmse', bestRMSE, false]].map(([label, key, best, higher]) => {
                const val = metrics[m.key][key]
                const isBest = higher ? val >= best - 0.001 : val <= best + 0.001
                return (
                  <div key={key} style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: '#5a6478', marginBottom: 2 }}>{label}</div>
                    <div style={{
                      fontSize: 18, fontWeight: 600,
                      color: isBest ? MODEL_COLORS[m.key] : '#e2e8f0',
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {val.toFixed(3)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Scatter */}
      <div style={S.card}>
        <div style={S.cardTitle}>Actual vs Predicted</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {modelList.map(m => (
            <button key={m.key} onClick={() => setActiveScatter(m.key)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              background: activeScatter === m.key ? MODEL_COLORS[m.key] : 'transparent',
              color: activeScatter === m.key ? '#0f1117' : MODEL_COLORS[m.key],
              border: `1px solid ${MODEL_COLORS[m.key]}`,
              fontWeight: activeScatter === m.key ? 600 : 400,
            }}>{m.name}</button>
          ))}
        </div>
        <div style={{ height: 280 }}>
          <Scatter data={scatterData} options={scatterOpts} />
        </div>
      </div>

      {/* Bar */}
      <div style={S.card}>
        <div style={S.cardTitle}>Error Comparison (MAE &amp; RMSE)</div>
        <div style={{ height: 220 }}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      {/* Analysis */}
      <div style={S.card}>
        <div style={S.cardTitle}>Comparative Analysis</div>
        <div style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 14 }}>
            <strong style={{ color: MODEL_COLORS[bestModel?.key] }}>{bestModel?.name}</strong> achieved
            the highest R² of{' '}
            <span style={{ color: '#e2e8f0', fontFamily: "'DM Mono', monospace" }}>
              {metrics[bestModel?.key]?.r2.toFixed(3)}
            </span>
            , explaining the most variance in student anxiety levels.
          </p>
          <p style={{ marginBottom: 14 }}>
            <strong style={{ color: MODEL_COLORS.lr }}>Linear Regression</strong>{' '}
            (R²={metrics.lr.r2.toFixed(3)}, MAE={metrics.lr.mae.toFixed(3)}): The most interpretable model.
            Its coefficients directly quantify each feature's contribution. Works well because many stress
            factors have approximately linear relationships with anxiety, such as depression score and peer pressure.
          </p>
          <p style={{ marginBottom: 14 }}>
            <strong style={{ color: MODEL_COLORS.svm }}>SVM Regression</strong>{' '}
            (R²={metrics.svm.r2.toFixed(3)}, MAE={metrics.svm.mae.toFixed(3)}): Uses an ε-insensitive loss
            function making it robust to outliers in student records. C=100 with RBF kernel captures
            non-linear patterns while regularization prevents overfitting on this mid-size dataset.
          </p>
          <p>
            <strong style={{ color: MODEL_COLORS.nn }}>Neural Network</strong>{' '}
            (R²={metrics.nn.r2.toFixed(3)}, MAE={metrics.nn.mae.toFixed(3)}): Two hidden layers (64→32 neurons)
            with ReLU activations and Adam optimizer capture non-linear interactions — e.g. how depression
            and social support together affect anxiety differently than either alone. Early stopping prevents
            overfitting.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Features Tab ─────────────────────────────────────────────────────────────
function FeaturesTab({ fi, apiOnline }) {
  const [activeModel, setActiveModel] = useState('lr')

  if (!apiOnline) {
    return (
      <div style={{ color: '#5a6478', padding: 40, textAlign: 'center' }}>
        API is offline. Start <code style={{ color: '#f07048' }}>python api.py</code> and refresh.
      </div>
    )
  }

  if (!fi) {
    return (
      <div style={{ ...S.card, color: '#5a6478', padding: 40, textAlign: 'center' }}>
        <div style={{ marginBottom: 12, fontSize: 14 }}>Loading feature importance…</div>
        <div style={{ fontSize: 12 }}>
          Make sure the{' '}
          <code style={{ color: '#5b8dee', fontFamily: "'DM Mono', monospace" }}>/feature_importance</code>{' '}
          endpoint is added to <code style={{ color: '#5b8dee', fontFamily: "'DM Mono', monospace" }}>api.py</code>.
        </div>
      </div>
    )
  }

  const modelList = [
    { key: 'lr',  name: 'Linear Regression' },
    { key: 'svm', name: 'SVM Regression' },
    { key: 'nn',  name: 'Neural Network' },
  ]

  const color  = MODEL_COLORS[activeModel]
  const scores = fi[activeModel] // array of 20 numbers

  const sorted = FEATURES
    .map((f, i) => ({ ...f, score: scores[i] ?? 0 }))
    .sort((a, b) => b.score - a.score)

  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}>Feature Importance by Model</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {modelList.map(m => (
            <button key={m.key} onClick={() => setActiveModel(m.key)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              background: activeModel === m.key ? MODEL_COLORS[m.key] : 'transparent',
              color: activeModel === m.key ? '#0f1117' : MODEL_COLORS[m.key],
              border: `1px solid ${MODEL_COLORS[m.key]}`,
              fontWeight: activeModel === m.key ? 600 : 400,
            }}>{m.name}</button>
          ))}
        </div>

        {sorted.map((f, rank) => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{
              fontSize: 11, color: '#3a4256', width: 20, textAlign: 'right',
              fontFamily: "'DM Mono', monospace",
            }}>{rank + 1}</span>
            <span style={{ fontSize: 12, color: '#8892a4', width: 200, flexShrink: 0 }}>{f.label}</span>
            <div style={{ flex: 1, height: 18, background: '#1e2235', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(f.score * 100).toFixed(1)}%`,
                background: color,
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{
              fontSize: 12, color: '#5a6478', width: 38, textAlign: 'right',
              fontFamily: "'DM Mono', monospace",
            }}>
              {(f.score * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}>Methodology</div>
        <div style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: MODEL_COLORS.lr }}>Linear Regression</strong>: Importance = |coefficient|
            normalized over the sum of all absolute coefficients. Features with larger weights contribute
            more to the prediction.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: MODEL_COLORS.svm }}>SVM Regression</strong>: Permutation importance —
            each feature is randomly shuffled on the test set and the resulting increase in RMSE is recorded.
            Larger RMSE increase means higher importance.
          </p>
          <p>
            <strong style={{ color: MODEL_COLORS.nn }}>Neural Network</strong>: Permutation importance on the
            test set using sklearn's <code style={{ fontFamily: "'DM Mono', monospace", color: '#5b8dee' }}>permutation_importance</code>.
            Features that cause the largest error increase when permuted are considered most impactful.
          </p>
        </div>
      </div>

      {/* Top 5 side-by-side */}
      <div style={S.card}>
        <div style={S.cardTitle}>Top 5 Features — All Models</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {modelList.map(m => {
            const top5 = FEATURES
              .map((f, i) => ({ ...f, score: fi[m.key][i] ?? 0 }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 5)
            return (
              <div key={m.key}>
                <div style={{ fontSize: 11, color: MODEL_COLORS[m.key], marginBottom: 10, fontWeight: 500 }}>
                  {m.name}
                </div>
                {top5.map((f, i) => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: '#3a4256', width: 14, fontFamily: "'DM Mono', monospace" }}>{i + 1}</span>
                    <span style={{ fontSize: 12, color: '#8892a4', flex: 1 }}>{f.label}</span>
                    <span style={{ fontSize: 12, color: MODEL_COLORS[m.key], fontFamily: "'DM Mono', monospace" }}>
                      {(f.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}