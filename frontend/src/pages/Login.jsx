import { useState } from "react";
import { motion } from "framer-motion";

export default function Login({ isDark, user }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("operator");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name) return alert("Please enter your name.");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser = { name, role };
    localStorage.setItem("user", JSON.stringify(newUser));
    window.location.href = `/${role}`;
  };

  if (user) {
    return (
       <div className={`w-full h-screen flex flex-col items-center justify-center p-10 antialiased ${isDark ? 'bg-prime-bgDark' : 'bg-prime-bg'}`}>
          <div className="flex flex-col items-center gap-6">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                 <span className="text-white text-[12px] font-bold font-mono">GL</span>
             </div>
             <p className={`text-[14px] font-medium animate-pulse ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>Loading your workspace...</p>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[12px] text-red-500 hover:text-red-400 mt-4 transition-colors">Sign Out</button>
          </div>
       </div>
    );
  }

  return (
    <div className={`w-full min-h-screen flex items-center justify-center p-6 antialiased
        ${isDark ? 'bg-[#000000]' : 'bg-[#fafafa]'}
    `}>
      {/* Subtle grid background */}
      <div className={`absolute inset-0 z-0 pointer-events-none opacity-30
         ${isDark ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDAuNWgyMFYwaC0yMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8cGF0aCBkPSJNMCAwdjIwaDAuNXYtMjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+")]' 
                 : 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDAuNWgyMFYwaC0yMHoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8cGF0aCBkPSJNMCAwdjIwaDAuNXYtMjB6IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+")]'}
      `}></div>

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="w-full flex justify-center mb-8">
           <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-12 h-12 flex items-center justify-center shadow-xl rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10"
           >
               <span className="text-white text-[18px] font-bold font-mono tracking-tighter">GL</span>
           </motion.div>
        </div>

        {/* Card */}
        <div className={`w-full p-8 rounded-2xl border shadow-2xl relative overflow-hidden
           ${isDark ? 'bg-[#0a0a0a] border-[#27272a] shadow-[0_40px_80px_rgba(0,0,0,0.8)]' : 'bg-white border-[#e4e4e7] shadow-[0_20px_60px_rgba(0,0,0,0.06)]'}
        `}>
           {/* Top gradient line */}
           <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>

           <div className="text-center mb-8">
              <h1 className={`text-[22px] font-semibold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Welcome to GarmentLink</h1>
              <p className={`text-[13px] ${isDark ? 'text-[#a1a1aa]' : 'text-[#71717a]'}`}>Sign in to access your dashboard.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-5">
              
              <div className="space-y-1.5">
                 <label className={`text-[12px] font-medium ${isDark ? 'text-[#e4e4e7]' : 'text-gray-700'}`}>Your Name</label>
                 <input
                   type="text" value={name} onChange={(e) => setName(e.target.value)} autoFocus spellCheck="false" placeholder="Enter your name"
                   className={`w-full h-11 px-4 text-[14px] font-medium rounded-lg border outline-none transition-all duration-200 focus:ring-2 focus:ring-prime-blue/40
                       ${isDark ? 'bg-[#18181b] border-[#27272a] text-white placeholder-[#52525b] focus:border-prime-blue' 
                                : 'bg-[#fafafa] border-[#e4e4e7] text-black placeholder-[#a1a1aa] focus:border-prime-blue'}
                   `}
                 />
              </div>

              <div className="space-y-1.5">
                 <label className={`text-[12px] font-medium ${isDark ? 'text-[#e4e4e7]' : 'text-gray-700'}`}>Your Role</label>
                 <select value={role} onChange={(e) => setRole(e.target.value)}
                   className={`w-full h-11 px-4 text-[14px] font-medium rounded-lg border outline-none transition-all duration-200 appearance-none cursor-pointer focus:ring-2 focus:ring-prime-blue/40
                       ${isDark ? 'bg-[#18181b] border-[#27272a] text-white focus:border-prime-blue' 
                                : 'bg-[#fafafa] border-[#e4e4e7] text-black focus:border-prime-blue'}
                   `}
                 >
                   <option value="operator">Operator — Costing & Waste</option>
                   <option value="supervisor">Supervisor — Analytics & Approvals</option>
                 </select>
              </div>

              <motion.button
                 whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                 type="submit" disabled={isLoading}
                 className={`w-full h-11 mt-2 flex items-center justify-center rounded-lg font-semibold text-[14px] transition-all duration-200 disabled:opacity-50 select-none shadow-sm text-white
                     bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]
                 `}
              >
                 {isLoading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-t-transparent border-white rounded-full"></motion.div>
                 ) : (
                    "Sign In →"
                 )}
              </motion.button>

           </form>
           
           <div className={`mt-8 pt-6 border-t text-center ${isDark ? 'border-[#27272a]' : 'border-[#e4e4e7]'}`}>
               <p className={`text-[11px] ${isDark ? 'text-[#52525b]' : 'text-[#a1a1aa]'}`}>GarmentLink • Intelligent Garment Industry Platform</p>
           </div>
        </div>

      </motion.div>
    </div>
  );
}
