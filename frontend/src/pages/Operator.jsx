import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function Operator() {
  const [form, setForm] = useState({
    style: "",
    quantity: "",
    fabric1: "",
    fabric2: "",
    cmt: "",
    embellishments: "",
    trims: "",
    fpt: "",
    rejection: "1",
    markup: ""
  });

  const [result, setResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setCalculating(true);
    setResult(null);
    
    // Simulate complex calculation for animation smoothness
    await new Promise(resolve => setTimeout(resolve, 800));

    const base =
      (+form.fabric1 || 0) +
      (+form.fabric2 || 0) +
      (+form.cmt || 0) +
      (+form.embellishments || 0) +
      (+form.trims || 0) +
      (+form.fpt || 0);

    const adjusted = base * (+form.rejection || 1);
    const finalPerPiece = adjusted * (1 + (+form.markup || 0) / 100);
    const total = finalPerPiece * (+form.quantity || 0);

    const sendData = {
      style: form.style || "Unnamed Style",
      quantity: +form.quantity || 0,
      baseCost: base,
      finalPerPiece,
      total
    };

    try {
      await axios.post("http://localhost:5000/save", sendData);
    } catch (err) {
      console.log("Backend offline, working locally.");
    }

    setResult({
      base: base.toFixed(2),
      finalPerPiece: finalPerPiece.toFixed(2),
      total: total.toFixed(2)
    });
    setCalculating(false);
  };

  const inputs = [
      { label: "Style Number", name: "style", type: "text", ph: "e.g., AW23-01" },
      { label: "Production Quantity", name: "quantity", type: "number", ph: "e.g., 5000" },
      { label: "Primary Fabric ($)", name: "fabric1", type: "number", ph: "0.00" },
      { label: "Lining/Secondary ($)", name: "fabric2", type: "number", ph: "0.00" },
      { label: "CMT (Cut, Make, Trim) ($)", name: "cmt", type: "number", ph: "0.00" },
      { label: "Embellishments ($)", name: "embellishments", type: "number", ph: "0.00" },
      { label: "Trims & Hardware ($)", name: "trims", type: "number", ph: "0.00" },
      { label: "Testing & Packaging ($)", name: "fpt", type: "number", ph: "0.00" },
      { label: "Rejection Factor (1.05 = +5%)", name: "rejection", type: "number", ph: "1.0" },
      { label: "Overheads & Profit Markup (%)", name: "markup", type: "number", ph: "0" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-[#050510] text-gray-900 dark:text-gray-100 transition-colors duration-700">
      
      {/* Premium Gradient Orbs in Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300 dark:bg-indigo-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-300 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[180px] opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 p-8 md:p-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-12"
      >
        
        {/* Left Side: Copy and Form */}
        <div className="flex-1">
            <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400"
            >
              Intelligent Costing.
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 font-light max-w-md"
            >
              Engineer your garment margins with extreme precision. Enter your raw data and instantly predict market costs.
            </motion.p>

            <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-2xl border border-white/20 dark:border-white/5 p-8 rounded-[2rem] shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputs.map((input, idx) => (
                  <motion.div 
                     key={input.name}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 + (idx * 0.05) }}
                     className="group"
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 group-focus-within:text-indigo-500 transition-colors">
                        {input.label}
                    </label>
                    <div className="relative">
                        <input
                          name={input.name}
                          type={input.type}
                          value={form[input.name]}
                          onChange={handleChange}
                          placeholder={input.ph}
                          className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all shadow-sm placeholder-gray-300 dark:placeholder-gray-700 font-medium"
                        />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={calculate}
                disabled={calculating}
                className="w-full mt-10 bg-gradient-to-r from-gray-900 to-black dark:from-indigo-600 dark:to-purple-600 hover:shadow-xl hover:shadow-indigo-500/20 text-white py-5 rounded-2xl text-lg font-bold tracking-wide transition-all overflow-hidden relative group"
              >
                {calculating ? (
                   <span className="flex items-center justify-center gap-3">
                       <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       Computing Margins...
                   </span>
                ) : (
                    "Compute Structure"
                )}
                {/* Gloss Accent */}
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-white/20 skew-x-12 group-hover:left-[200%] transition-all duration-700 ease-in-out"></div>
              </motion.button>
            </div>
        </div>

        {/* Right Side: Results */}
        <div className="w-full md:w-[450px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {result ? (
                   <motion.div 
                       key="results"
                       initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                       animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                       exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                       transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
                       className="space-y-6"
                   >
                       <ResultCard 
                          subtitle="Direct Manufacturing" 
                          title="Base Cost / Piece" 
                          value={result.base} 
                       />
                       <ResultCard 
                          subtitle="With Rejection & Markup" 
                          title="Final Cost / Piece" 
                          value={result.finalPerPiece} 
                       />
                       <ResultCard 
                          subtitle="Total Contract Value" 
                          title="Total Order Value" 
                          value={result.total} 
                          highlight 
                       />
                   </motion.div>
                ) : (
                   <motion.div 
                       key="empty"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       exit={{ opacity: 0 }}
                       className="h-full border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-[2rem] flex items-center justify-center p-12 text-center text-gray-400 dark:text-gray-600"
                   >
                       <p className="text-xl font-light">Enter cost parameters to unlock projection algorithms.</p>
                   </motion.div>
                )}
            </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}

function ResultCard({ title, subtitle, value, highlight }) {
  return (
    <motion.div 
       whileHover={{ scale: 1.03, y: -5 }}
       className={`p-8 rounded-[2rem] border overflow-hidden relative shadow-2xl backdrop-blur-xl transition-all ${
           highlight 
           ? "bg-gradient-to-br from-indigo-600 to-purple-800 border-indigo-500/30 text-white" 
           : "bg-white/80 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white"
       }`}
    >
      <div className="relative z-10">
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{subtitle}</p>
          <p className={`text-lg mb-4 ${highlight ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>{title}</p>
          <p className="text-5xl font-black tracking-tighter">
             <span className="text-3xl font-medium opacity-50 mr-1">$</span>
             {value}
          </p>
      </div>
      
      {/* Background flare on highlight cards */}
      {highlight && (
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      )}
    </motion.div>
  );
}
