import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function WasteManagement() {
  const [formData, setFormData] = useState({
    fabric_length: "",
    fabric_width: "",
    pattern_length: "",
    pattern_width: "",
    count: "",
    cost_per_meter: "",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FEATURE: Voice Assistant (Speech to Text) ---
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Assistant.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      // Very basic EPICS prototype NLP logic extraction
      const numbers = transcript.match(/\d+(\.\d+)?/g);
      
      if (numbers && numbers.length >= 2) {
          setFormData(prev => ({
              ...prev,
              fabric_length: numbers[0],
              fabric_width: numbers[1],
              pattern_length: numbers[2] || prev.pattern_length,
              pattern_width: numbers[3] || prev.pattern_width,
              count: numbers[4] || prev.count,
              cost_per_meter: numbers[5] || prev.cost_per_meter,
          }));
          alert(`Voice recognized: ${transcript}`);
      } else {
          alert(`Heard: "${transcript}". Please clearly state lengths and widths as numbers.`);
      }
    };
    recognition.start();
  };

  // --- FEATURE: Text to Speech (Audio Feedback) ---
  const speakFeedback = (textArr) => {
      if ('speechSynthesis' in window) {
          const text = textArr.join(". ");
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
      }
  };

  // --- FEATURE: Computer Vision Scan ---
  const handleCameraCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    
    try {
      const res = await fetch("http://localhost:8000/estimate-waste-image", {
          method: "POST",
          body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "CV Error");
      
      setFormData(prev => ({
          ...prev,
          fabric_length: data.estimated_length,
          fabric_width: data.estimated_width
      }));
      alert(`CV Detected Dimensions: ${data.estimated_length}m x ${data.estimated_width}m`);
    } catch (err) {
      setError("Camera Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        fabric_length: parseFloat(formData.fabric_length),
        fabric_width: parseFloat(formData.fabric_width),
        pattern_length: parseFloat(formData.pattern_length),
        pattern_width: parseFloat(formData.pattern_width),
        count: parseInt(formData.count),
        cost_per_meter: parseFloat(formData.cost_per_meter),
      };

      const res = await fetch("http://localhost:8000/sustainable-waste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Error calculating waste");
      }

      setResults(data);
      if (data.suggestions) {
          speakFeedback(data.suggestions);
      }
      
      // Feature: Marketplace Push 
      // If eco_score is low, we push it to the node backend Marketplace
      if (data.data.environmental.eco_score < 70) {
           await fetch("http://localhost:5000/marketplace-listing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    waste_kg: data.data.environmental.waste_kg_est,
                    suggested_price: data.data.metrics.waste_cost * 0.1, // sell scraps at 10% value
                    status: "Available"
                })
           }).catch(console.error);
      }
      
      // Feature: Leaderboard Points
      if (data.data.environmental.eco_score >= 90) {
          const user = JSON.parse(localStorage.getItem("user"));
          if(user) {
              await fetch("http://localhost:5000/award-points", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: user.email, points: 50 })
              }).catch(console.error);
          }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEcoColor = (score) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Sustainable Fabric Waste Optimization 🌱
          </h1>
          <div className="flex gap-4 border-b-2">
              <button 
                  onClick={startVoiceInput} 
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold shadow transition hover:bg-blue-200 ${listening ? 'animate-pulse bg-red-100 text-red-800' : ''}`}
              >
                  🎤 {listening ? "Listening..." : "Voice Assistant"}
              </button>
              
              <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleCameraCapture} 
              />
              <button 
                  onClick={() => fileInputRef.current.click()} 
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-bold shadow transition hover:bg-purple-200"
              >
                  📷 Scan CV Camera
              </button>
          </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form
            onSubmit={handleCalculate}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fabric Length (m)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="fabric_length"
                  value={formData.fabric_length}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fabric Width (m)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  name="fabric_width"
                  value={formData.fabric_width}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pattern L (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="pattern_length"
                    value={formData.pattern_length}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pattern W (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="pattern_width"
                    value={formData.pattern_width}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Yield (Pieces)</label>
                  <input
                    type="number"
                    required
                    name="count"
                    value={formData.count}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost / m ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    name="cost_per_meter"
                    value={formData.cost_per_meter}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:bg-indigo-400"
            >
              {loading ? "Calculating..." : "Optimize & Calculate"}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-8">
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Score output removed from here for brevity, keeping only essential components for snippet */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-8 border-green-500 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Eco Score Sustainability Rating</h2>
                  <p className="text-gray-500 dark:text-gray-400">Classified as: <strong>{results.data.environmental.eco_rating}</strong></p>
                  
                  {results.data.environmental.eco_score < 70 && (
                     <p className="text-xs text-orange-500 font-bold mt-2">
                        ⚠️ High waste detected. Scraps auto-listed to NGO Marketplace.
                     </p>
                  )}
                  {results.data.environmental.eco_score >= 90 && (
                     <p className="text-xs text-green-600 font-bold mt-2">
                        🏆 +50 EPICS Eco Points Awarded to your profile!
                     </p>
                  )}
                </div>
                <div className={`text-5xl font-extrabold ${getEcoColor(results.data.environmental.eco_score)}`}>
                  {results.data.environmental.eco_score}
                  <span className="text-xl text-gray-400">/100</span>
                </div>
              </div>

              {/* EPICS Physical Equivalence Metrics */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                     <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">Carbon Footprint</p>
                     <p className="text-3xl font-black">{results.data.environmental.co2_emissions_kg} <span className="text-sm opacity-50">kg CO₂</span></p>
                     <p className="text-xs text-gray-500 mt-2">Equivalent to driving <strong>{(results.data.environmental.co2_emissions_kg * 2.5).toFixed(0)} miles</strong> in a gas car.</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                     <p className="text-sm font-bold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-1">Offset Target</p>
                     <p className="text-3xl font-black">{(results.data.environmental.co2_emissions_kg / 21).toFixed(1)} <span className="text-sm opacity-50">Trees</span></p>
                     <p className="text-xs text-gray-500 mt-2">Required planting to neutralize this batch.</p>
                  </div>
              </div>

              {/* Grid 2: Layout Optimization */}
              {results.data.optimization && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 self-start">
                    📏 Layout Visualization ({results.data.optimization.best_orientation})
                  </h3>
                  
                  <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                      {results.data.optimization.layout_rows * results.data.optimization.layout_cols > 0 && (
                        <div 
                           className="grid gap-1 p-2 bg-blue-500/20 w-full max-w-sm" 
                           style={{
                              gridTemplateColumns: `repeat(${results.data.optimization.layout_cols}, minmax(0, 1fr))`,
                           }}
                        >
                           {Array.from({ length: Math.min(results.data.optimization.max_items, 150) }).map((_, i) => (
                              <div key={i} className="bg-blue-600 aspect-square rounded-sm shadow-sm" title={`Piece ${i+1}`}></div>
                           ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>🤖</span> AI Voice Feedback 
                  <button onClick={() => speakFeedback(results.suggestions)} className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">🔊 Replay</button>
                </h3>
                <ul className="space-y-2">
                  {results.suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg border border-blue-100 dark:border-blue-800"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
