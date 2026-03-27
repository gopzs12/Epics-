import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

export default function WasteManagement({ isDark }) {
  const [formData, setFormData] = useState({
    fabric_length: "", fabric_width: "", pattern_length: "", pattern_width: "", count: "", cost_per_meter: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCameraCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setError(null);
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/estimate-waste-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "CV Error");
      setFormData(prev => ({ ...prev, fabric_length: data.estimated_length, fabric_width: data.estimated_width }));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleCalculate = async (e) => {
    e?.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload = {
        fabric_length: parseFloat(formData.fabric_length), fabric_width: parseFloat(formData.fabric_width),
        pattern_length: parseFloat(formData.pattern_length), pattern_width: parseFloat(formData.pattern_width),
        count: parseInt(formData.count), cost_per_meter: parseFloat(formData.cost_per_meter),
      };
      const res = await fetch("http://localhost:8000/sustainable-waste", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Server Error");
      setResults(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const inputFields = [
    { name: "fabric_length", label: "Fabric Length (meters)", icon: "↔" },
    { name: "fabric_width", label: "Fabric Width (meters)", icon: "↕" },
    { name: "pattern_length", label: "Pattern Length (meters)", icon: "□" },
    { name: "pattern_width", label: "Pattern Width (meters)", icon: "□" },
    { name: "count", label: "Target Garments", icon: "#" },
    { name: "cost_per_meter", label: "Fabric Cost (₹/meter)", icon: "₹" },
  ];

  // Build Predicted vs Actual chart data
  const getComparisonData = () => {
    if (!results?.data?.ml_prediction) return [];
    return [
      { name: "Actual (Rule-Based)", value: results.data.metrics.waste_percentage, fill: "#3b82f6" },
      { name: "ML Predicted", value: results.data.ml_prediction.predicted_waste_percentage, fill: "#8b5cf6" },
    ];
  };

  const getMetricsChartData = () => {
    if (!results) return [];
    const m = results.data.metrics;
    const e = results.data.environmental;
    return [
      { name: "Waste %", value: m.waste_percentage, fill: m.waste_percentage > 30 ? "#ef4444" : m.waste_percentage > 15 ? "#f59e0b" : "#22c55e" },
      { name: "Eco Score", value: e.eco_score, fill: "#22c55e" },
      { name: "CO₂ (kg)", value: e.co2_emissions_kg, fill: "#f59e0b" },
    ];
  };

  const hybrid = results?.data?.hybrid_analysis;
  const mlPred = results?.data?.ml_prediction;

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1500px]">
         <div>
             <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Waste Management
             </h1>
             <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
                Hybrid AI System — Rule-based calculator + ML prediction + Environmental analysis
             </p>
         </div>
         <div className="flex gap-3 items-center">
             <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleCameraCapture} />
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current.click()} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-[13px] border shadow-sm transition-all
                   ${isDark ? 'bg-[#18181b] border-[#27272a] hover:border-[#3f3f46] text-white' : 'bg-white border-[#e4e4e7] hover:border-[#d4d4d8] text-gray-900'}`}>
                📷 Scan Fabric
             </motion.button>
             <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleCalculate} disabled={loading}
                className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all disabled:opacity-50 shadow-sm text-white
                   ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}>
                {loading ? <span className="flex items-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⟳</motion.span>Analyzing...</span> : "Run Hybrid Analysis"}
             </motion.button>
         </div>
      </div>

      <div className="flex-1 w-full max-w-[1500px]">
          <div className="grid xl:grid-cols-12 gap-8">
             
             {/* Input Card */}
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`xl:col-span-3 flex flex-col p-7 rounded-xl shadow-sm border ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                <h3 className={`text-[14px] font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fabric Parameters</h3>
                <div className="space-y-4">
                   {inputFields.map((field) => (
                       <div key={field.name} className="flex flex-col">
                          <label className={`text-[11px] font-medium mb-1 flex items-center gap-1.5 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
                             <span className="opacity-50">{field.icon}</span> {field.label}
                          </label>
                          <input name={field.name} type="number" step="0.01" value={formData[field.name]} onChange={handleChange} placeholder="0.00"
                            className={`w-full rounded-lg px-3 h-9 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-prime-blue/40
                               ${isDark ? 'bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] focus:border-prime-blue' 
                                        : 'bg-[#fafafa] border border-[#e4e4e7] text-gray-900 placeholder-[#a1a1aa] focus:border-prime-blue'}`} />
                       </div>
                   ))}
                </div>
                <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                       className={`mt-5 font-medium p-3 rounded-lg border text-[12px] ${isDark ? 'bg-red-950/50 text-red-400 border-red-900/50' : 'bg-red-50 text-red-600 border-red-200'}`}>
                        ⚠ {error}
                    </motion.div>
                )}
                </AnimatePresence>
             </motion.div>

             {/* Results */}
             <div className="xl:col-span-9">
                 <AnimatePresence mode="wait">
                 {results ? (
                     <motion.div initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                        className="space-y-6">
                         
                         {/* ML Prediction Banner */}
                         {mlPred && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                               className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4
                                  ${isDark ? 'bg-gradient-to-r from-violet-950/30 to-[#0a0a0a] border-violet-500/20' : 'bg-gradient-to-r from-violet-50 to-white border-violet-200'}`}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[18px] ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>🧠</div>
                                  <div>
                                     <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        ML Prediction: {mlPred.predicted_waste_percentage}% waste
                                     </p>
                                     <p className={`text-[11px] mt-0.5 ${isDark ? 'text-violet-300/60' : 'text-violet-600'}`}>
                                        {mlPred.model_type === 'random_forest' ? `Random Forest (${mlPred.n_estimators} trees)` : 'Fallback Model'} • Confidence: {mlPred.confidence}
                                        {mlPred.prediction_std !== undefined && ` • σ: ±${mlPred.prediction_std}%`}
                                     </p>
                                  </div>
                               </div>
                               {hybrid && (
                                  <div className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border
                                     ${hybrid.risk_level === 'low' ? (isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200') :
                                       hybrid.risk_level === 'moderate' ? (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200') :
                                       hybrid.risk_level === 'high' ? (isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200') :
                                       (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200')}`}>
                                     Risk: {hybrid.risk_level.toUpperCase()}
                                  </div>
                               )}
                            </motion.div>
                         )}

                         {/* Key Metrics */}
                         <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                             {[
                                { label: "Actual Waste", value: `${results.data.metrics.waste_percentage}%`, color: results.data.metrics.waste_percentage > 30 ? 'text-red-500' : results.data.metrics.waste_percentage > 15 ? 'text-amber-500' : 'text-green-500', sub: "Rule-based" },
                                { label: "ML Predicted", value: `${mlPred?.predicted_waste_percentage || '—'}%`, color: 'text-violet-500', sub: mlPred?.confidence || '—' },
                                { label: "Difference", value: `${hybrid?.difference || '—'}%`, color: (hybrid?.difference || 0) < 3 ? 'text-green-500' : 'text-amber-500', sub: hybrid?.system_verdict?.slice(0,2) || '' },
                                { label: "Eco Score", value: `${results.data.environmental.eco_score}/100`, color: 'text-green-500', sub: results.data.environmental.eco_rating },
                                { label: "CO₂ Output", value: `${results.data.environmental.co2_emissions_kg} kg`, color: 'text-amber-500', sub: `${results.data.environmental.trees_to_offset} trees to offset` },
                             ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                                   className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                   <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>{stat.label}</p>
                                   <p className={`text-[20px] font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
                                   <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#52525b]' : 'text-gray-400'}`}>{stat.sub}</p>
                                </motion.div>
                             ))}
                         </div>

                         <div className="grid lg:grid-cols-2 gap-6">
                              {/* Predicted vs Actual Bar Chart */}
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                 className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <h3 className={`font-semibold text-[13px] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>🧠 Predicted vs Actual Waste</h3>
                                 <p className={`text-[11px] mb-5 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Rule-based calculation vs Random Forest ML prediction</p>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={getComparisonData()} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                                          <XAxis dataKey="name" stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 10, fontWeight: 500 }} />
                                          <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 10 }} label={{ value: 'Waste %', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa' } }} />
                                          <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: isDark ? '#09090b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, borderRadius: '8px', fontSize: '12px' }} />
                                          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                                             {getComparisonData().map((e, i) => <Cell key={i} fill={e.fill} />)}
                                          </Bar>
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                              </motion.div>

                              {/* Environmental Bar Chart */}
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                 className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <h3 className={`font-semibold text-[13px] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>🌍 Environmental Impact</h3>
                                 <p className={`text-[11px] mb-5 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Sustainability metrics from this cutting batch</p>
                                 <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <BarChart data={getMetricsChartData()} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                                          <XAxis dataKey="name" stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 11 }} />
                                          <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 10 }} />
                                          <Tooltip contentStyle={{ backgroundColor: isDark ? '#09090b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, borderRadius: '8px', fontSize: '12px' }} />
                                          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                                             {getMetricsChartData().map((e, i) => <Cell key={i} fill={e.fill} />)}
                                          </Bar>
                                       </BarChart>
                                    </ResponsiveContainer>
                                 </div>
                              </motion.div>
                         </div>

                         {/* Hybrid Intelligence Insights */}
                         {hybrid && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                               className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                               <h3 className={`font-semibold text-[13px] mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  💡 AI Insights & Recommendations
                               </h3>
                               <div className="grid md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                     <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>System Insights</p>
                                     {hybrid.insights.map((insight, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                                           className={`p-3 rounded-lg text-[12px] leading-relaxed border ${isDark ? 'bg-[#09090b] border-[#27272a] text-[#e4e4e7]' : 'bg-gray-50 border-[#e4e4e7] text-gray-700'}`}>
                                           {insight}
                                        </motion.div>
                                     ))}
                                  </div>
                                  <div className="space-y-3">
                                     <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Smart Suggestions</p>
                                     {hybrid.suggestions.map((sug, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
                                           className={`p-3 rounded-lg text-[12px] leading-relaxed border ${isDark ? 'bg-[#09090b] border-[#27272a] text-[#e4e4e7]' : 'bg-gray-50 border-[#e4e4e7] text-gray-700'}`}>
                                           {sug}
                                        </motion.div>
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                         )}

                         {/* Info Cards Row */}
                         <div className="grid md:grid-cols-3 gap-4">
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                                 className={`p-5 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <span className="text-[24px]">🌳</span>
                                 <div>
                                    <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Trees to Offset: {results.data.environmental.trees_to_offset}</p>
                                    <p className={`text-[11px] mt-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>To neutralize {results.data.environmental.co2_emissions_kg} kg CO₂</p>
                                 </div>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                 className={`p-5 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <span className="text-[24px]">📐</span>
                                 <div>
                                    <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Layout: {results.data.optimization.best_orientation}</p>
                                    <p className={`text-[11px] mt-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>{results.data.optimization.layout_rows}×{results.data.optimization.layout_cols} grid, max {results.data.optimization.max_items} pieces</p>
                                 </div>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                                 className={`p-5 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <span className="text-[24px]">💰</span>
                                 <div>
                                    <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Waste Cost: ₹{results.data.metrics.waste_cost}</p>
                                    <p className={`text-[11px] mt-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>{results.data.metrics.waste_area.toFixed(2)} m² of fabric wasted</p>
                                 </div>
                              </motion.div>
                         </div>

                         {/* Cutting Grid */}
                         {results.data.optimization.max_items > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                               className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                               <div className="flex justify-between items-center mb-4">
                                  <div>
                                     <h3 className={`font-semibold text-[13px] ${isDark ? 'text-white' : 'text-gray-900'}`}>Cutting Layout Preview</h3>
                                     <p className={`text-[11px] ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Each square = 1 garment pattern piece</p>
                                  </div>
                                  <div className={`px-3 py-1.5 rounded text-[11px] font-mono flex gap-2 items-center border
                                     ${isDark ? 'bg-[#052e16] border-[#064e3b] text-[#34d399]' : 'bg-green-50 border-green-200 text-green-600'}`}>
                                     <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#34d399]' : 'bg-green-500'}`}></span>
                                     {results.data.optimization.max_items} pieces
                                  </div>
                               </div>
                               <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-gray-50 border-[#e4e4e7]'}`}>
                                  <div className="grid gap-[3px] max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${results.data.optimization.layout_cols}, minmax(0, 1fr))` }}>
                                     {Array.from({ length: Math.min(results.data.optimization.max_items, 200) }).map((_, i) => (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.003, duration: 0.15 }}
                                           key={i} className="aspect-square rounded-[3px] bg-blue-500" />
                                     ))}
                                  </div>
                               </div>
                            </motion.div>
                         )}
                     </motion.div>
                 ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                         className={`rounded-xl h-[500px] flex flex-col items-center justify-center text-center p-10 border border-dashed
                            ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-gray-50/50 border-[#e4e4e7]'}`}>
                         <div className={`w-16 h-16 border rounded-2xl mb-5 flex items-center justify-center opacity-30 ${isDark ? 'border-[#3f3f46]' : 'border-[#d4d4d8]'}`}>
                            <span className="text-[24px]">🧠</span>
                         </div>
                         <h3 className={`text-[15px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Hybrid AI System Ready</h3>
                         <p className={`text-[12px] leading-relaxed max-w-[320px] ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>
                            Enter fabric dimensions and click "Run Hybrid Analysis" to get both rule-based calculations AND ML predictions with smart insights.
                         </p>
                         <div className={`mt-6 flex gap-4 text-[11px] font-medium ${isDark ? 'text-[#52525b]' : 'text-gray-400'}`}>
                            <span>📊 Rule-Based</span>
                            <span>•</span>
                            <span>🧠 Machine Learning</span>
                            <span>•</span>
                            <span>🌍 Environmental</span>
                         </div>
                     </motion.div>
                 )}
                 </AnimatePresence>
             </div>
          </div>
      </div>
    </div>
  );
}
