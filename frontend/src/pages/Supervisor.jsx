import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export default function Supervisor() {
  const [records, setRecords] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    // Get historical Costings from Node Backend
    axios.get("http://localhost:5000/all")
      .then(res => setRecords(res.data))
      .catch((e) => console.log("Backend Offline"));
  }, []);

  const runAdvancedForecast = async () => {
      setLoadingForecast(true);
      try {
          // Send heavily mocked dummy data just to trigger the python trajectory model
          const payload = {
            fabric_length: 100,
            fabric_width: 2,
            pattern_length: 1.5,
            pattern_width: 1.5,
            count: 50,
            cost_per_meter: 4.5
          };
          
          const response = await fetch("http://localhost:8000/forecast", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload)
          });
          const data = await response.json();
          setForecast(data);
      } catch (err) {
          console.error("Forecast Engine error:", err);
      }
      setLoadingForecast(false);
  };

  return (
    <div className="min-h-screen p-8 lg:p-12 dark:bg-[#050510] dark:text-white transition-colors duration-700 relative overflow-hidden">
      
      {/* Background Holographic Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-900/20 rounded-full mix-blend-screen filter blur-[200px] opacity-70"></div>
      <div className="absolute bottom-[0%] left-[-20%] w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-900/20 rounded-full mix-blend-screen filter blur-[150px] opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-end mb-12">
            <div>
               <h1 className="text-5xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                  Analytics Command Center
               </h1>
               <p className="text-gray-500 dark:text-gray-400 font-light max-w-xl text-lg">
                  Real-time aggregation of factory floor operations. Tap into Predictive AI to monitor upcoming environmental and financial impact margins.
               </p>
            </div>
            
            <button 
               onClick={runAdvancedForecast}
               disabled={loadingForecast}
               className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105"
            >
               {loadingForecast ? "Simulating Timeline..." : "⚡ Run AI Forecast Matrix"}
            </button>
        </div>

        {/* AI Forecast Matrix (Populated by Python) */}
        <AnimatePresence>
            {forecast && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="mb-12"
                >
                    <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-black p-[2px] rounded-[2rem] shadow-2xl relative">
                        <div className="absolute top-0 right-10 w-32 h-[2px] bg-indigo-400 shadow-[0_0_10px_#818cf8]"></div>
                        <div className="bg-white/10 dark:bg-black/60 backdrop-blur-3xl p-8 rounded-[2rem] h-full border border-white/5">
                            
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                🔮 Predictive Trajectory System
                            </h2>
                            <p className="text-indigo-200 mb-8 max-w-3xl leading-relaxed text-sm">
                                {forecast.verdict}
                            </p>
                            
                            <div className="grid lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-8 h-80">
                                   <ResponsiveContainer width="100%" height="100%">
                                      <AreaChart data={forecast.forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                          <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                          </linearGradient>
                                          <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                          </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis dataKey="timeline" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '1rem' }} />
                                        <Legend />
                                        <Area type="monotone" name="Pollution Growth (kg CO2)" dataKey="projected_co2_kg" stroke="#ef4444" fillOpacity={1} fill="url(#colorWaste)" />
                                        <Area type="monotone" name="Margin Loss ($)" dataKey="projected_financial_loss" stroke="#eab308" fillOpacity={1} fill="url(#colorLoss)" />
                                      </AreaChart>
                                   </ResponsiveContainer>
                                </div>
                                <div className="lg:col-span-4 flex flex-col justify-center gap-6">
                                     <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20">
                                         <h3 className="text-red-400 font-bold mb-1 uppercase text-xs">Accumulated Emissions</h3>
                                         <p className="text-4xl font-black text-white">{forecast.forecast[5].projected_co2_kg} <span className="text-lg opacity-50">kg CO₂</span></p>
                                     </div>
                                     <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20 hover:scale-105 transition">
                                         <h3 className="text-emerald-400 font-bold mb-1 uppercase text-xs">EPICS Offset Target</h3>
                                         <p className="text-white text-sm">To offset this 6-month projection, you must plant:</p>
                                         <p className="text-5xl font-black text-emerald-300 mt-2">🌳 {forecast.forecast[5].trees_needed}</p>
                                         <p className="text-emerald-400/50 mt-1 text-xs">Full-growth trees</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Existing Historical Data Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700">
               <h3 className="text-xl font-bold mb-6">Historical Style Value Volume</h3>
               <ResponsiveContainer width="100%" height={280}>
                 <BarChart data={records}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                   <XAxis dataKey="style" />
                   <YAxis />
                   <Tooltip cursor={{ fill: '#00000010' }} contentStyle={{ borderRadius: '1rem' }} />
                   <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
               <h3 className="text-xl font-bold mb-6">Recent Deployments</h3>
               <div className="flex-1 overflow-y-auto pr-2">
                   <div className="space-y-3">
                       {records.map((r, index) => (
                          <div key={index} className="bg-white dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-700 flex justify-between items-center hover:scale-[1.02] transition">
                              <div>
                                  <p className="font-bold">{r.style}</p>
                                  <p className="text-xs text-gray-400">Qty: {r.quantity}</p>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-indigo-600 dark:text-indigo-400">${r.total?.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">${r.finalPerPiece?.toFixed(2)} /unit</p>
                              </div>
                          </div>
                       ))}
                       {records.length === 0 && <p className="text-gray-400 italic">No historical costing data available.</p>}
                   </div>
               </div>
            </div>
        </div>

      </motion.div>
    </div>
  );
}
