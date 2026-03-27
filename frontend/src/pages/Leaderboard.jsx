import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard({ isDark }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/leaderboard")
      .then(res => res.json())
      .then(data => setLeaders(data))
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      {/* Header */}
      <div className="mb-10 w-full max-w-[800px]">
         <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🏆 Global Leaderboard
         </h1>
         <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
            Operators ranked by Eco Points. Score 90+ on Eco Score to earn points!
         </p>
      </div>

      <div className="w-full max-w-[800px]">
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
            
            {/* Header Row */}
            <div className={`px-6 py-4 border-b flex items-center text-[12px] font-semibold uppercase tracking-wider
                ${isDark ? 'border-[#27272a] bg-[#09090b] text-[#71717a]' : 'border-[#e4e4e7] bg-gray-50 text-gray-500'}
            `}>
               <div className="w-16 text-center">Rank</div>
               <div className="flex-1">Operator</div>
               <div className="w-32 text-right">Eco Points</div>
            </div>
            
            {/* Rows */}
            <div className={`divide-y ${isDark ? 'divide-[#27272a]' : 'divide-[#e4e4e7]'}`}>
               <AnimatePresence>
               {leaders.map((user, idx) => (
                   <motion.div 
                       key={user.name}
                       initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }}
                       className={`flex items-center px-6 py-5 transition-colors
                          ${isDark ? 'hover:bg-[#18181b]' : 'hover:bg-gray-50'}
                          ${idx === 0 ? (isDark ? 'bg-amber-500/5' : 'bg-amber-50/50') : ''}
                       `}
                   >
                       <div className="w-16 text-center">
                          {idx < 3 ? (
                             <span className="text-[22px]">{medals[idx]}</span>
                          ) : (
                             <span className={`text-[16px] font-bold ${isDark ? 'text-[#52525b]' : 'text-gray-400'}`}>#{idx + 1}</span>
                          )}
                       </div>
                       
                       <div className="flex-1 flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold text-white shadow-sm
                              ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
                           `}>
                              {user.name.charAt(0).toUpperCase()}
                           </div>
                           <div>
                               <p className={`text-[14px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                               {idx === 0 && <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>🔥 Top Saver of the Month</p>}
                           </div>
                       </div>
                       
                       <div className="w-32 text-right">
                           <span className={`text-[20px] font-bold ${idx === 0 ? 'text-amber-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                               {user.points}
                           </span>
                           <span className={`text-[11px] ml-1 ${isDark ? 'text-[#71717a]' : 'text-gray-400'}`}>pts</span>
                       </div>
                   </motion.div>
               ))}
               </AnimatePresence>

               {leaders.length === 0 && (
                  <div className="p-12 text-center">
                     <p className={`text-[13px] ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>No rankings yet. Start computing waste layouts with Eco Score 90+ to earn points!</p>
                  </div>
               )}
            </div>
         </motion.div>
      </div>
    </div>
  );
}
