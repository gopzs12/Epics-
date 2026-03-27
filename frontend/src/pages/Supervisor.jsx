import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from "recharts";

export default function Supervisor({ isDark }) {
  const [records, setRecords] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/all")
      .then(res => setRecords(res.data))
      .catch((e) => console.log("Backend Offline"));
  }, []);

  const runAdvancedForecast = async () => {
      setLoadingForecast(true);
      try {
          const payload = {
            fabric_length: 100, fabric_width: 2, pattern_length: 1.5, pattern_width: 1.5, count: 50, cost_per_meter: 4.5
          };
          const response = await fetch("http://localhost:8000/forecast", {
             method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
          });
          const data = await response.json();
          setForecast(data);
      } catch (err) {}
      setLoadingForecast(false);
  };

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      {/* Header */}
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1400px]">
         <div>
            <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Analytics Hub
            </h1>
            <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
               View costing records, run waste forecasts, and track factory performance.
            </p>
         </div>
         <div>
            <button 
               onClick={runAdvancedForecast} disabled={loadingForecast}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium text-[13px] transition-all duration-200 disabled:opacity-50 select-none shadow-sm text-white
                  ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                           : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
               `}
            >
               {loadingForecast ? "Running Forecast..." : "Run AI Forecast"}
               <motion.span animate={{ rotate: loadingForecast ? 360 : 0 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="ml-1">
                  {loadingForecast ? "⟳" : "∿"}
               </motion.span>
            </button>
         </div>
      </div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto">
        <div className="space-y-8">
            
            {/* Forecast Area Block */}
            <AnimatePresence>
                {forecast && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.98, height: 0 }}
                       animate={{ opacity: 1, scale: 1, height: 'auto' }}
                       transition={{ duration: 0.3, ease: "easeOut" }}
                       className={`p-8 rounded-xl border flex flex-col xl:flex-row gap-8 overflow-hidden relative
                          ${isDark ? 'bg-[#0a0a0a] border-[#27272a] shadow-black/40' : 'bg-white border-[#e4e4e7] shadow-gray-200/50'}
                       `}
                    >
                        <div className="flex-1 relative z-10 w-full">
                            <h2 className={`text-[14px] font-semibold flex items-center gap-3
                               ${isDark ? 'text-white' : 'text-gray-900'}
                            `}>
                               6-Month Waste Forecast
                            </h2>
                            <p className={`text-[12px] font-medium mt-1 mb-8 opacity-80
                               ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}
                            `}>Verdict: {forecast.verdict}</p>
                            
                            <div className="h-[280px] w-full">
                               <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={forecast.forecast} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? "#3b82f6" : "#2563eb"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isDark ? "#3b82f6" : "#2563eb"} stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isDark ? "#a1a1aa" : "#71717a"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isDark ? "#a1a1aa" : "#71717a"} stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                                    <XAxis dataKey="timeline" stroke={isDark ? "#a1a1aa" : "#71717a"} tick={{fontSize: 11, fontWeight: 500}} />
                                    <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} tick={{fontSize: 11, fontWeight: 500}} />
                                    <Tooltip 
                                       contentStyle={{ 
                                          backgroundColor: isDark ? '#09090b' : '#ffffff', 
                                          borderRadius: '8px', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, 
                                          fontSize: '13px', fontWeight: '500', color: isDark ? '#fafafa' : '#09090b', 
                                          boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.05)' 
                                       }} 
                                    />
                                    <Legend wrapperStyle={{fontSize: '12px', fontWeight: 500, paddingTop: '20px'}}/>
                                    
                                    <Area type="monotone" name="CO₂ Emissions (kg)" dataKey="projected_co2_kg" stroke={isDark ? "#3b82f6" : "#2563eb"} strokeWidth={2} fillOpacity={1} fill="url(#colorWaste)" />
                                    <Area type="monotone" name="Financial Loss (₹)" dataKey="projected_financial_loss" stroke={isDark ? "#a1a1aa" : "#71717a"} strokeWidth={2} fillOpacity={1} fill="url(#colorLoss)" />
                                  </AreaChart>
                               </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Right Summary Panel */}
                        <div className="xl:w-[320px] flex flex-col gap-6 justify-center mt-6 xl:mt-0 relative z-10">
                             <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors
                                 ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-gray-50 border-[#e4e4e7]'}
                             `}>
                                 <h3 className={`font-semibold mb-2 text-[12px] 
                                    ${isDark ? 'text-white' : 'text-gray-900'}
                                 `}>Total CO₂ Emissions</h3>
                                 <p className={`text-[36px] font-semibold tracking-tight leading-none
                                    ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}
                                 `}>{forecast.forecast[5].projected_co2_kg}
                                   <span className={`text-[12px] ml-1 uppercase font-mono ${isDark ? 'text-[#71717a]' : 'text-gray-400'}`}>kg CO₂</span>
                                 </p>
                             </div>
                             
                             <div className={`p-6 rounded-xl border relative overflow-hidden transition-colors
                                 ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-gray-50 border-[#e4e4e7]'}
                             `}>
                                 <h3 className={`font-semibold mb-1 text-[12px]
                                     ${isDark ? 'text-white' : 'text-gray-900'}
                                 `}>Trees Needed to Offset</h3>
                                 <p className={`text-[10px] font-mono ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Biological carbon neutralization</p>
                                 
                                 <p className={`text-[42px] font-semibold tracking-tight mt-4 leading-none
                                    ${isDark ? 'text-white' : 'text-black'}
                                 `}>
                                    {forecast.forecast[5].trees_needed}
                                    <span className={`text-[14px] ml-2 uppercase font-mono ${isDark ? 'text-[#71717a]' : 'text-gray-400'}`}>Trees</span>
                                 </p>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Core Analytics Grids */}
            <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Costing Records Bar Chart */}
                <div 
                   className={`p-8 rounded-xl border transition-all
                      ${isDark ? 'bg-[#0a0a0a] border-[#27272a] shadow-black/40' : 'bg-white border-[#e4e4e7] shadow-gray-200/50'}
                   `}
                >
                   <h3 className={`text-[14px] font-semibold mb-8 flex items-center gap-2
                      ${isDark ? 'text-white' : 'text-gray-900'}
                   `}>
                      <span className={`w-3 h-3 rounded-sm ${isDark ? 'bg-prime-blue' : 'bg-blue-600'}`}></span>
                      Costing Records
                   </h3>
                   <div className="w-full h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={records}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#e4e4e7"} />
                          <XAxis dataKey="style" stroke={isDark ? "#a1a1aa" : "#71717a"} tick={{fontSize: 11, fontWeight: 500}} />
                          <YAxis stroke={isDark ? "#a1a1aa" : "#71717a"} tick={{fontSize: 11, fontWeight: 500}} />
                          <Tooltip 
                             cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }} 
                             contentStyle={{ 
                                backgroundColor: isDark ? '#09090b' : '#ffffff', 
                                borderRadius: '8px', border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`, 
                                fontSize: '13px', fontWeight: '500',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.05)'
                             }} 
                          />
                          <Bar 
                             dataKey="total" 
                             fill={isDark ? "#3b82f6" : "#2563eb"} 
                             radius={[4, 4, 0, 0]} 
                             barSize={40} 
                             onMouseEnter={(_, idx) => setHoveredBar(idx)}
                             onMouseLeave={() => setHoveredBar(null)}
                          >
                            {records.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={isDark ? "#3b82f6" : "#2563eb"} style={{
                                   opacity: hoveredBar === null || hoveredBar === index ? 1 : 0.4,
                                   transition: 'opacity 0.2s ease'
                               }} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                
                {/* Recent Submissions */}
                <div 
                   className={`p-8 rounded-xl border flex flex-col h-[460px] transition-all
                      ${isDark ? 'bg-[#0a0a0a] border-[#27272a] shadow-black/40' : 'bg-white border-[#e4e4e7] shadow-gray-200/50'}
                   `}
                >
                   <h3 className={`text-[14px] font-semibold mb-8 flex items-center gap-2
                      ${isDark ? 'text-white' : 'text-gray-900'}
                   `}>
                      <span className={`w-3 h-3 rounded-sm opacity-50 ${isDark ? 'bg-white' : 'bg-black'}`}></span>
                      Recent Submissions
                   </h3>
                   
                   <div className="flex-1 overflow-y-auto pr-4 space-y-3">
                       {records.map((r, index) => (
                          <div 
                             key={index} className={`rounded-lg p-4 flex justify-between items-center border transition-colors
                                ${isDark ? 'bg-[#09090b] border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46]' 
                                         : 'bg-gray-50 border-[#e4e4e7] hover:bg-white hover:border-[#d4d4d8]'}
                             `}
                          >
                              <div>
                                  <p className={`text-[14px] font-semibold tracking-tight uppercase
                                     ${isDark ? 'text-white' : 'text-gray-900'}
                                  `}>{r.style}</p>
                                  <p className={`text-[11px] font-medium mt-0.5
                                     ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}
                                  `}>Volume: {r.quantity}</p>
                              </div>
                              <div className="text-right">
                                  <p className={`text-[16px] font-semibold tracking-tight
                                     ${isDark ? 'text-white' : 'text-gray-900'}
                                  `}>₹{r.total?.toFixed(2)}</p>
                                  <p className={`text-[11px] font-medium mt-0.5
                                     ${isDark ? 'text-[#71717a]' : 'text-gray-400'}
                                  `}>₹{r.finalPerPiece?.toFixed(2)} / unit</p>
                              </div>
                          </div>
                       ))}
                       {records.length === 0 && (
                          <p className={`text-[13px] font-medium text-center mt-12
                             ${isDark ? 'text-[#a1a1aa]' : 'text-gray-400'}
                          `}>No costing records yet. Submit from the Costing page.</p>
                       )}
                   </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
}
