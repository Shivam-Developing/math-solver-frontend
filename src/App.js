import React, { useState } from 'react';
import axios from 'axios';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import './App.css';

const API = "https://math-solver-backend-4vjy.onrender.com/";  // your Render URL


function App() {
  const [expression, setExpression]   = useState('');
  const [variable, setVariable]       = useState('x');
  const [operation, setOperation]     = useState('solve');
  const [result, setResult]           = useState(null);
  const [steps, setSteps]             = useState([]);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [ocrLatex, setOcrLatex]       = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrLoading, setOcrLoading]   = useState(false);

  // ── Solver ──────────────────────────────────────────
  const handleSolve = async () => {
    if (!expression.trim()) { setError("Please enter an expression!"); return; }
    setLoading(true); setError(''); setResult(null); setSteps([]);
    try {
      const res = await axios.post(`${API}/compute`, {
        expression, variable, operation
      });
      if (res.data.error) setError(res.data.error);
      else { setResult(res.data.latex); setSteps(res.data.steps); }
    } catch {
      setError("❌ Cannot connect to backend. Is it running?");
    }
    setLoading(false);
  };

  // ── OCR ─────────────────────────────────────────────
  const handleOCR = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setOcrLoading(true); setError(''); setOcrLatex('');

    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/ocr`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.latex_detected) {
        setOcrLatex(res.data.latex_detected);
        setExpression(res.data.latex_detected); // auto-fills solver!
      } else {
        setError("Could not detect equation. Try a clearer image.");
      }
    } catch {
      setError("❌ OCR failed. Check backend.");
    }
    setOcrLoading(false);
  };

  // ── Clear All ────────────────────────────────────────
  const handleClear = () => {
    setExpression(''); setResult(null); setSteps([]);
    setError(''); setOcrLatex(''); setImagePreview(null);
  };

  return (
    <div className="container">

      {/* Header */}
      <div className="header">
        <h1>🧮 Smart Math Solver</h1>
        <p className="subtitle">Algebra • Calculus • Symbolic Computation • OCR</p>
      </div>

      {/* OCR Upload Box */}
      <div className="ocr-box">
        <h3>📷 Upload Equation Image</h3>
        <p>Photograph a handwritten or printed equation — auto-detected!</p>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleOCR}
          id="ocr-input"
          style={{ display: 'none' }}
        />
        <label htmlFor="ocr-input" className="upload-btn">
          {ocrLoading ? "🔍 Detecting equation..." : "📸 Choose / Capture Photo"}
        </label>

        {imagePreview && (
          <img src={imagePreview} alt="uploaded equation" className="preview-img" />
        )}
        {ocrLatex && (
          <div className="ocr-result">
            <p>✅ Detected Equation:</p>
            <BlockMath math={ocrLatex} />
            <p className="hint">Expression auto-filled below → Click Solve!</p>
          </div>
        )}
      </div>

      {/* Solver Form */}
      <div className="form">
        <input
          placeholder="Expression e.g.  x**2 - 5*x + 6   or   sin(x)*x"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
        />
        <div className="row">
          <input
            placeholder="Variable (default: x)"
            value={variable}
            onChange={(e) => setVariable(e.target.value)}
          />
          <select value={operation} onChange={(e) => setOperation(e.target.value)}>
            <option value="solve">🔍 Solve</option>
            <option value="diff">📐 Differentiate</option>
            <option value="integrate">∫ Integrate</option>
            <option value="simplify">✨ Simplify</option>
            <option value="factor">🔢 Factor</option>
          </select>
        </div>
        <div className="btn-row">
          <button onClick={handleSolve} disabled={loading} className="solve-btn">
            {loading ? "⏳ Computing..." : "Solve ✨"}
          </button>
          <button onClick={handleClear} className="clear-btn">🗑 Clear</button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="error">{error}</p>}

      {/* Result */}
      {result && (
        <div className="result-box">
          <h3>📊 Result:</h3>
          <BlockMath math={result} />
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="steps-box">
          <h3>📋 Step-by-Step Solution:</h3>
          {steps.map((s, i) => (
            <div key={i} className="step-item">
              <span className="step-num">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default App;
