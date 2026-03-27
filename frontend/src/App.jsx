import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login.jsx";
import Operator from "./pages/Operator.jsx";
import Supervisor from "./pages/Supervisor.jsx";
import WasteManagement from "./pages/WasteManagement.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Approvals from "./pages/Approvals.jsx";
import VirtualTryOn from "./pages/VirtualTryOn.jsx";
import AIAssistantWidget from "./components/AIAssistantWidget.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser && rawUser !== "undefined") setUser(JSON.parse(rawUser));
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setIsDark(true);
    }
  }, []);

  useEffect(() => {
     if (isDark) document.documentElement.classList.add("dark");
     else document.documentElement.classList.remove("dark");
  }, [isDark]);

  return (
    <div className={`flex w-full min-h-screen transition-colors duration-200 font-sans tracking-tight antialiased
      ${isDark ? 'bg-prime-bgDark text-prime-textDark selection:bg-white/20' : 'bg-prime-bg text-prime-text selection:bg-black/10'}
    `}>
      
      {user && <AIAssistantWidget user={user} isDark={isDark} />}

      {/* Enterprise Sidebar */}
      <AnimatePresence>
        {user && (
          <aside 
            className={`w-[280px] shrink-0 flex flex-col justify-between py-8 px-6 border-r transition-colors duration-200 z-20
               ${isDark ? 'bg-prime-bgDark border-prime-borderDark' : 'bg-prime-bg border-prime-border'}
            `}
          >
             <div className="w-full mb-10 flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded bg-prime-blue flex items-center justify-center">
                      <span className="text-white text-[12px] font-bold font-mono">GL</span>
                   </div>
                   <h1 className={`font-semibold text-[15px] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      GarmentLink
                   </h1>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark ? 'border-white/20 text-prime-gray' : 'border-black/10 text-gray-500'}`}>BETA</span>
             </div>

             <nav className="flex-1 space-y-8">
                <div>
                   <p className="text-[11px] font-medium text-prime-gray mb-3 px-2">Applications</p>
                   <ul className="space-y-1">
                      <SidebarLink to={`/${user.role === 'supervisor' ? 'supervisor' : 'operator'}`} label={user.role === 'supervisor' ? "Analytics Hub" : "Costing & Estimation"} isDark={isDark} icon="⌘" />
                      <SidebarLink to="/waste-management" label="Waste Optimizer" isDark={isDark} icon="◩" />
                      <SidebarLink to="/virtual-tryon" label="Virtual Try-On" isDark={isDark} icon="◎" />
                      {user.role === 'supervisor' && (
                         <SidebarLink to="/approvals" label="Approvals" isDark={isDark} icon="✓" />
                      )}
                   </ul>
                </div>
                
                <div>
                   <p className="text-[11px] font-medium text-prime-gray mb-3 px-2">Network</p>
                   <ul className="space-y-1">
                      <SidebarLink to="/marketplace" label="Marketplace" isDark={isDark} icon="⟳" />
                      <SidebarLink to="/leaderboard" label="Global Ranks" isDark={isDark} icon="★" />
                   </ul>
                </div>
             </nav>

             {/* Profile & Theme Switcher */}
             <div className={`mt-8 pt-6 space-y-3 w-full border-t ${isDark ? 'border-prime-borderDark' : 'border-prime-border'}`}>
                
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors
                     ${isDark ? 'text-prime-gray hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-black/5'}
                  `}
                >
                   <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
                   <kbd className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${isDark ? 'border-white/20 bg-white/5' : 'border-black/20 bg-black/5'}`}>
                      {isDark ? '☾' : '☼'}
                   </kbd>
                </button>

                <div 
                   onClick={() => { localStorage.clear(); window.location.href="/"; }}
                   className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors group
                      ${isDark ? 'text-prime-gray hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-black hover:bg-black/5'}
                   `}
                >
                   <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                         {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                   </div>
                   <span className="opacity-0 group-hover:opacity-100 text-[11px] text-red-500 transition-opacity">Exit</span>
                </div>

             </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <main className={`flex-1 relative z-10 w-full h-full overflow-y-auto ${isDark ? 'bg-prime-bgDark' : 'bg-prime-bg'}`}>
         <AnimatePresence mode="wait">
           <Routes>
             <Route path="/" element={<PageTransition><Login setIsDark={setIsDark} user={user} isDark={isDark} /></PageTransition>} />
             <Route path="/operator" element={<PageTransition><Operator isDark={isDark} /></PageTransition>} />
             <Route path="/supervisor" element={<PageTransition><Supervisor isDark={isDark} /></PageTransition>} />
             <Route path="/waste-management" element={<PageTransition><WasteManagement isDark={isDark} /></PageTransition>} />
             <Route path="/virtual-tryon" element={<PageTransition><VirtualTryOn isDark={isDark} /></PageTransition>} />
             <Route path="/marketplace" element={<PageTransition><Marketplace isDark={isDark} /></PageTransition>} />
             <Route path="/leaderboard" element={<PageTransition><Leaderboard isDark={isDark} /></PageTransition>} />
             <Route path="/approvals" element={<PageTransition><Approvals isDark={isDark} /></PageTransition>} />
           </Routes>
         </AnimatePresence>
      </main>

    </div>
  );
}

function SidebarLink({ to, label, icon, isDark }) {
   const location = useLocation();
   const active = location.pathname.includes(to) && to !== "/";

   return (
      <li>
         <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
             ${active 
               ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black") 
               : (isDark ? "text-prime-gray hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-black hover:bg-black/5")}
         `}>
            <span className="text-[12px] opacity-70">{icon}</span>
            <span>{label}</span>
         </Link>
      </li>
   );
}

function PageTransition({ children }) {
   return (
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.2, ease: "easeOut" }} 
        className="w-full h-full min-h-screen relative p-8 md:p-12"
      >
         {children}
      </motion.div>
   );
}
