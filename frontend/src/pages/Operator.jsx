import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Operator({ isDark }) {
  const [form, setForm] = useState({
    style: "", quantity: "", fabric1: "", fabric2: "", cmt: "", embellishments: "", trims: "", fpt: "", rejection: "1", markup: ""
  });

  const [result, setResult] = useState(null);
  const [mlData, setMlData] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [pieData, setPieData] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const calculate = async () => {
    setCalculating(true);
    setResult(null);
    setMlData(null);
    setSubmitted(false);

    const f1 = (+form.fabric1 || 0); const f2 = (+form.fabric2 || 0);
    const cmt = (+form.cmt || 0); const emb = (+form.embellishments || 0);
    const trim = (+form.trims || 0); const fpt = (+form.fpt || 0);

    const base = f1 + f2 + cmt + emb + trim + fpt;
    const adjusted = base * (+form.rejection || 1);
    const finalPerPiece = adjusted * (1 + (+form.markup || 0) / 100);
    const total = finalPerPiece * (+form.quantity || 0);

    setResult({ base: base.toFixed(2), finalPerPiece: finalPerPiece.toFixed(2), total: total.toFixed(2), style: form.style, quantity: form.quantity });
    setPieData([
       { name: "Primary Fabric", value: f1 }, { name: "Secondary Fabric", value: f2 }, { name: "CMT", value: cmt },
       { name: "Embellishments", value: emb }, { name: "Trims", value: trim }, { name: "Compliance", value: fpt }
    ].filter(item => item.value > 0));

    // Call ML Hybrid Costing API
    try {
      const res = await fetch("http://localhost:8000/hybrid-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primary_fabric: f1,
          secondary_fabric: f2,
          cmt: cmt,
          embellishments: emb,
          trims: trim,
          compliance: fpt,
          quantity: +form.quantity || 1,
          rejection_factor: +form.rejection || 1,
          markup_pct: +form.markup || 0
        })
      });
      const data = await res.json();
      if (data.success) setMlData(data.data);
    } catch (err) {
      console.log("ML Cost API not available, showing formula only");
    }
    
    setCalculating(false);
  };

  const submitApproval = async () => {
      // Send to backend for Analytics Hub
      try {
          await axios.post("http://localhost:5000/save", {
              style: result.style || "Unknown",
              quantity: parseInt(result.quantity) || 0,
              baseCost: parseFloat(result.base),
              finalPerPiece: parseFloat(result.finalPerPiece),
              total: parseFloat(result.total)
          });
      } catch (err) {
          console.log("Failed to save to backend:", err);
      }

      const pending = JSON.parse(localStorage.getItem("pending_approvals") || "[]");
      pending.push({
          id: Date.now(), style: result.style || "Unknown", quantity: result.quantity || 0,
          total: result.total, base: result.base, status: "pending", timestamp: new Date().toISOString()
      });
      localStorage.setItem("pending_approvals", JSON.stringify(pending));
      setSubmitted(true);
  };

  const inputs = [
      { label: "Style ID", name: "style", type: "text", ph: "Enter SKU or Style" },
      { label: "Volume (Units)", name: "quantity", type: "number", ph: "0" },
      { label: "Primary Fabric (₹)", name: "fabric1", type: "number", ph: "0.00" },
      { label: "Secondary Fabric (₹)", name: "fabric2", type: "number", ph: "0.00" },
      { label: "CMT Assembly (₹)", name: "cmt", type: "number", ph: "0.00" },
      { label: "Embellishments (₹)", name: "embellishments", type: "number", ph: "0.00" },
      { label: "Trims & Hardware (₹)", name: "trims", type: "number", ph: "0.00" },
      { label: "Testing & Compliance (₹)", name: "fpt", type: "number", ph: "0.00" },
      { label: "Rejection Factor", name: "rejection", type: "number", ph: "1.00" },
      { label: "Markup Margin (%)", name: "markup", type: "number", ph: "0.0" }
  ];

  const PIE_COLORS = isDark 
     ? ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#818cf8']
     : ['#2563eb', '#4f46e5', '#7c3aed', '#8b5cf6', '#3b82f6', '#6366f1'];

  const hybrid = mlData?.hybrid_analysis;
  const mlPred = mlData?.ml_prediction;

  // Comparison chart data
  const getComparisonData = () => {
    if (!result || !mlPred) return [];
    return [
      { name: "Formula Cost", value: parseFloat(result.finalPerPiece), fill: "#3b82f6" },
      { name: "AI Predicted", value: mlPred.predicted_per_piece, fill: "#8b5cf6" },
    ];
  };

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      <div className="mb-8 w-full flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
         <div>
            <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Costing & Estimation
            </h1>
            <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
               Hybrid System — Industry formula + AI cost prediction with intelligent insights
            </p>
         </div>
      </div>

      <div className="w-full flex-1">
          <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px]">
             
             {/* Input Card */}
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`xl:w-[420px] shrink-0 p-7 rounded-xl border shadow-sm
                 ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                <h2 className={`text-[14px] font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cost Components</h2>
                
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                   {inputs.map((input) => (
                     <div key={input.name} className={`flex flex-col ${input.name === 'style' ? 'col-span-2' : ''}`}>
                        <label className={`text-[11px] font-medium mb-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>{input.label}</label>
                        <input name={input.name} type={input.type} value={form[input.name]} onChange={handleChange} placeholder={input.ph}
                          className={`w-full rounded-lg px-3 h-9 text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-prime-blue/40
                             ${isDark ? 'bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b] focus:border-prime-blue' 
                                      : 'bg-[#fafafa] border border-[#e4e4e7] text-gray-900 placeholder-[#a1a1aa] focus:border-prime-blue'}`} />
                     </div>
                   ))}
                </div>

                <div className={`mt-8 pt-5 border-t flex justify-end ${isDark ? 'border-[#27272a]' : 'border-[#e4e4e7]'}`}>
                   <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                     onClick={calculate} disabled={calculating}
                     className="w-full px-8 h-11 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                     {calculating ? <span className="flex items-center justify-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⟳</motion.span>Analyzing...</span> : "Run Hybrid Analysis"}
                   </motion.button>
                </div>
             </motion.div>

             {/* Results */}
             <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    {result ? (
                       <motion.div key="results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                          className="space-y-5">

                           {/* ML Prediction Banner */}
                           {mlPred && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                 className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4
                                    ${isDark ? 'bg-gradient-to-r from-violet-950/30 to-[#0a0a0a] border-violet-500/20' : 'bg-gradient-to-r from-violet-50 to-white border-violet-200'}`}>
                                 <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[18px] ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>🧠</div>
                                    <div>
                                       <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                          AI Predicted Cost: ₹{mlPred.predicted_per_piece}/piece
                                       </p>
                                       <p className={`text-[11px] mt-0.5 ${isDark ? 'text-violet-300/60' : 'text-violet-600'}`}>
                                          {mlPred.model_type === 'random_forest' ? `Random Forest (${mlPred.n_estimators} trees)` : 'Fallback'} • Confidence: {mlPred.confidence}
                                          {mlPred.prediction_std !== undefined && ` • σ: ±₹${mlPred.prediction_std}`}
                                       </p>
                                    </div>
                                 </div>
                                 {hybrid && (
                                    <div className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border
                                       ${hybrid.cost_risk === 'optimal' ? (isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-50 text-green-700 border-green-200') :
                                         hybrid.cost_risk === 'slight_overrun' ? (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200') :
                                         hybrid.cost_risk === 'savings_possible' ? (isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200') :
                                         (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200')}`}>
                                       {hybrid.system_verdict}
                                    </div>
                                 )}
                              </motion.div>
                           )}

                           {/* Summary Cards */}
                           <div className={`grid ${mlPred ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-3'} gap-4`}>
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                  className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Base Cost</p>
                                  <p className={`text-[20px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{result.base}</p>
                               </motion.div>
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                  className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Formula/Unit</p>
                                  <p className={`text-[20px] font-bold tracking-tight text-blue-500`}>₹{result.finalPerPiece}</p>
                               </motion.div>
                               {mlPred && (
                                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                     className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                     <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>AI Predicted/Unit</p>
                                     <p className={`text-[20px] font-bold tracking-tight text-violet-500`}>₹{mlPred.predicted_per_piece}</p>
                                  </motion.div>
                               )}
                               {hybrid && (
                                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                     className={`p-4 rounded-xl border text-center ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                     <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Difference</p>
                                     <p className={`text-[20px] font-bold tracking-tight ${hybrid.difference_per_piece > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {hybrid.difference_per_piece > 0 ? '+' : ''}₹{hybrid.difference_per_piece}
                                     </p>
                                     <p className={`text-[10px] ${isDark ? 'text-[#52525b]' : 'text-gray-400'}`}>{hybrid.difference_pct}%</p>
                                  </motion.div>
                               )}
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                  className={`p-4 rounded-xl border text-center ${isDark ? 'bg-gradient-to-b from-blue-600/10 to-transparent border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Order</p>
                                  <p className={`text-[20px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-blue-700'}`}>₹{result.total}</p>
                               </motion.div>
                           </div>

                           <div className="grid lg:grid-cols-2 gap-5">
                               {/* Formula vs ML Bar Chart */}
                               {mlPred && (
                                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                                     className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                     <h3 className={`font-semibold text-[13px] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>🧠 Formula vs AI Prediction</h3>
                                     <p className={`text-[11px] mb-5 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Per-piece cost: industry formula vs Random Forest ML</p>
                                     <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                           <BarChart data={getComparisonData()} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                                              <XAxis dataKey="name" stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 11 }} />
                                              <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 10 }} label={{ value: '₹ / piece', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: isDark ? '#71717a' : '#a1a1aa' } }} />
                                              <RechartsTooltip formatter={(v) => `₹${v}`} contentStyle={{ backgroundColor: isDark ? '#09090b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, borderRadius: '8px', fontSize: '12px' }} />
                                              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={65}>
                                                 {getComparisonData().map((e, i) => <Cell key={i} fill={e.fill} />)}
                                              </Bar>
                                           </BarChart>
                                        </ResponsiveContainer>
                                     </div>
                                  </motion.div>
                               )}

                               {/* Component Breakdown Bar Chart */}
                               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                  className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                   <h3 className={`font-semibold text-[13px] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>📊 Cost Breakdown</h3>
                                   <p className={`text-[11px] mb-5 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>X: component • Y: cost (₹)</p>
                                   <div className="h-[200px] w-full">
                                      <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={pieData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                                            <XAxis dataKey="name" stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={50} />
                                            <YAxis stroke={isDark ? "#71717a" : "#a1a1aa"} tick={{ fontSize: 10 }} />
                                            <RechartsTooltip formatter={(v) => `₹${v}`} contentStyle={{ backgroundColor: isDark ? '#09090b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, borderRadius: '8px', fontSize: '12px' }} />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                                               {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Bar>
                                         </BarChart>
                                      </ResponsiveContainer>
                                   </div>
                               </motion.div>
                           </div>

                           {/* AI Insights Panel */}
                           {hybrid && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                 className={`p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <h3 className={`font-semibold text-[13px] mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    💡 AI Cost Intelligence
                                 </h3>
                                 <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2.5">
                                       <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Cost Insights</p>
                                       {hybrid.insights.map((insight, i) => (
                                          <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}
                                             className={`p-3 rounded-lg text-[12px] leading-relaxed border ${isDark ? 'bg-[#09090b] border-[#27272a] text-[#e4e4e7]' : 'bg-gray-50 border-[#e4e4e7] text-gray-700'}`}>
                                             {insight}
                                          </motion.div>
                                       ))}
                                    </div>
                                    <div className="space-y-2.5">
                                       <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Smart Recommendations</p>
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

                           {/* Pie Chart + Submit */}
                           <div className="grid lg:grid-cols-2 gap-5">
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                                 className={`p-6 rounded-xl border shadow-sm overflow-hidden relative ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                 <h3 className={`font-semibold text-[13px] mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Proportional Split</h3>
                                 <p className={`text-[11px] mb-3 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Hover to see %</p>
                                 <div className="h-[180px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <PieChart>
                                        <Pie data={pieData} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none" cornerRadius={4}
                                          onMouseEnter={(_, idx) => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)}>
                                          {pieData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} 
                                               style={{ opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.3, transition: 'opacity 0.2s ease' }} />
                                          ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(v) => `₹${v}`} contentStyle={{ backgroundColor: isDark ? '#09090b' : '#fff', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, borderRadius: '8px', fontSize: '12px' }} />
                                      </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                       <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Total</span>
                                       <span className={`text-[18px] font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{result.total}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 justify-center">
                                    {pieData.map((d, i) => (
                                       <div key={i} className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                                          <span className={`text-[10px] font-medium ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>{d.name}</span>
                                       </div>
                                    ))}
                                 </div>
                              </motion.div>

                              {/* Composition + Submit */}
                              <div className="flex flex-col gap-4">
                                 {/* Material/Labor split */}
                                 {hybrid && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                       className={`p-5 rounded-xl border ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                                       <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Cost Composition</p>
                                       <div className="space-y-2.5">
                                          <div>
                                             <div className="flex justify-between text-[11px] mb-1">
                                                <span className={isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}>Material</span>
                                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{hybrid.material_percentage}%</span>
                                             </div>
                                             <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#27272a]' : 'bg-gray-200'}`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${hybrid.material_percentage}%` }} transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                                                   className="h-full rounded-full bg-blue-500" />
                                             </div>
                                          </div>
                                          <div>
                                             <div className="flex justify-between text-[11px] mb-1">
                                                <span className={isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}>Labor (CMT)</span>
                                                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{hybrid.labor_percentage}%</span>
                                             </div>
                                             <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#27272a]' : 'bg-gray-200'}`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${hybrid.labor_percentage}%` }} transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
                                                   className="h-full rounded-full bg-violet-500" />
                                             </div>
                                          </div>
                                       </div>
                                    </motion.div>
                                 )}

                                 {/* Submit */}
                                 <motion.button whileHover={{ scale: submitted ? 1 : 1.02 }} whileTap={{ scale: submitted ? 1 : 0.97 }}
                                    onClick={submitApproval} disabled={submitted}
                                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all
                                       ${submitted 
                                          ? (isDark ? 'bg-[#052e16] border border-[#064e3b] text-[#34d399]' : 'bg-green-50 border border-green-200 text-green-600') 
                                          : (isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800')}`}>
                                    {submitted ? "✓ Forwarded to Supervisor" : "Submit for Approval →"}
                                 </motion.button>
                              </div>
                           </div>
                       </motion.div>
                    ) : (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={`rounded-xl h-[400px] flex flex-col items-center justify-center text-center p-12 ${isDark ? 'bg-[#09090b] border border-dashed border-[#27272a]' : 'bg-gray-50/50 border border-dashed border-[#e4e4e7]'}`}>
                           <div className={`w-16 h-16 border rounded-2xl mb-5 flex items-center justify-center opacity-30 ${isDark ? 'border-[#3f3f46]' : 'border-[#d4d4d8]'}`}>
                              <span className="text-[24px]">🧠</span>
                           </div>
                           <h3 className={`text-[15px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Hybrid Costing System Ready</h3>
                           <p className={`text-[12px] leading-relaxed max-w-[300px] ${isDark ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>Enter your cost components and click "Run Hybrid Analysis" to get industry formula + AI prediction with intelligent insights.</p>
                           <div className={`mt-5 flex gap-3 text-[11px] font-medium ${isDark ? 'text-[#52525b]' : 'text-gray-400'}`}>
                              <span>📋 Formula</span><span>•</span><span>🧠 ML Prediction</span><span>•</span><span>💡 Insights</span>
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
