import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/leaderboard")
      .then(res => res.json())
      .then(data => setLeaders(data))
      .catch(err => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto dark:text-white min-h-screen">
      <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">
             🏆 Eco Warriors Leaderboard
          </h1>
          <p className="text-gray-500">Compete to save the most fabric and earn the highest Eco Scores!</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-indigo-50 dark:bg-indigo-900/40 p-4 border-b dark:border-indigo-800 flex font-bold text-indigo-800 dark:text-indigo-200 uppercase text-sm">
             <div className="w-16 text-center">Rank</div>
             <div className="flex-1">Operator Profile</div>
             <div className="w-32 text-right">Eco Points</div>
          </div>
          
          <ul>
              <AnimatePresence>
              {leaders.map((user, idx) => (
                  <motion.li 
                      key={user.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center p-6 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition ${idx === 0 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
                  >
                      <div className="w-16 text-center text-2xl font-black text-gray-400 dark:text-gray-500">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </div>
                      
                      <div className="flex-1 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow-inner font-bold ${idx === 0 ? 'bg-yellow-400' : 'bg-indigo-400'}`}>
                             {user.name.charAt(0)}
                          </div>
                          <div>
                              <p className="font-bold text-lg">{user.name}</p>
                              {idx === 0 && <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold tracking-wider">Top Saver of the Month</p>}
                          </div>
                      </div>
                      
                      <div className="w-32 text-right">
                          <span className={`text-2xl font-black ${idx === 0 ? 'text-yellow-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {user.points}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">pts</span>
                      </div>
                  </motion.li>
              ))}
              </AnimatePresence>
          </ul>
      </div>
    </div>
  );
}
