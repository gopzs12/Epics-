import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Approvals({ isDark }) {
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    const fetchApprovals = () => {
        const raw = localStorage.getItem("pending_approvals");
        if (raw) setApprovals(JSON.parse(raw).reverse());
    };
    fetchApprovals();
    
    // Listen for storage changes if multiple tabs are open
    window.addEventListener("storage", fetchApprovals);
    return () => window.removeEventListener("storage", fetchApprovals);
  }, []);

  const handleAction = (id, status) => {
      const updated = approvals.map(app => 
         app.id === id ? { ...app, status } : app
      );
      setApprovals(updated);
      localStorage.setItem("pending_approvals", JSON.stringify(updated.reverse()));
  };

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      {/* Enterprise Header */}
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1400px]">
         <div>
            <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
               Command Approvals
            </h1>
            <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
               Review and authorize pending costing estimations from the floor operators.
            </p>
         </div>
      </div>

      <div className="flex-1 w-full max-w-[1000px]">
          
          <div className={`rounded-xl border shadow-sm overflow-hidden 
             ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}
          `}>
             {/* List Header */}
             <div className={`px-6 py-4 border-b flex items-center justify-between text-[12px] font-semibold uppercase tracking-wider
                 ${isDark ? 'border-[#27272a] bg-[#09090b] text-[#71717a]' : 'border-[#e4e4e7] bg-gray-50 text-gray-500'}
             `}>
                 <div className="w-[30%]">Submission Data</div>
                 <div className="w-[30%]">Financial Vector</div>
                 <div className="w-[40%] text-right">Authorization</div>
             </div>

             {/* Items List */}
             <div className="divide-y divide-[#e4e4e7] dark:divide-[#27272a]">
                 <AnimatePresence>
                     {approvals.map((item) => (
                         <motion.div 
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            key={item.id} 
                            className={`px-6 py-5 flex items-center justify-between transition-colors
                               ${isDark ? 'hover:bg-[#18181b]' : 'hover:bg-gray-50'}
                            `}
                         >
                             {/* Col 1 */}
                             <div className="w-[30%]">
                                <p className={`text-[14px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.style}</p>
                                <p className={`text-[12px] mt-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>Volume: {item.quantity}</p>
                             </div>

                             {/* Col 2 */}
                             <div className="w-[30%]">
                                <p className={`text-[14px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{item.total}</p>
                                <p className={`text-[12px] mt-1 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>Base: ₹{item.base}</p>
                             </div>

                             {/* Col 3: Actions */}
                             <div className="w-[40%] flex justify-end items-center gap-3">
                                 {item.status === 'pending' ? (
                                    <>
                                       <button 
                                          onClick={() => handleAction(item.id, 'rejected')}
                                          className={`px-4 py-2 rounded-md font-medium text-[12px] transition-colors
                                             ${isDark ? 'text-[#fca5a5] hover:bg-[#450a0a]' : 'text-red-600 hover:bg-red-50'}
                                          `}
                                       >
                                          Reject
                                       </button>
                                       <button 
                                          onClick={() => handleAction(item.id, 'approved')}
                                          className={`px-6 py-2 rounded-md font-medium text-[12px] text-white shadow-sm transition-all
                                             ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90'}
                                          `}
                                       >
                                          Approve
                                       </button>
                                    </>
                                 ) : (
                                    <div className={`px-4 py-2 rounded-md text-[12px] font-semibold flex items-center gap-2 border
                                        ${item.status === 'approved' 
                                          ? (isDark ? 'bg-[#052e16] border-[#064e3b] text-[#34d399]' : 'bg-green-50 border-green-200 text-green-600')
                                          : (isDark ? 'bg-[#450a0a] border-[#7f1d1d] text-[#fca5a5]' : 'bg-red-50 border-red-200 text-red-600')}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'approved' ? (isDark ? 'bg-[#34d399]' : 'bg-green-500') : (isDark ? 'bg-[#fca5a5]' : 'bg-red-500')}`}></span>
                                        {item.status === 'approved' ? 'AUTHORIZED' : 'DENIED'}
                                    </div>
                                 )}
                             </div>
                         </motion.div>
                     ))}
                 </AnimatePresence>

                 {approvals.length === 0 && (
                     <div className="p-10 text-center">
                         <div className={`w-12 h-12 mx-auto rounded-full border mb-4 flex items-center justify-center opacity-50
                            ${isDark ? 'border-[#3f3f46]' : 'border-[#d4d4d8]'}
                         `}>
                             <span className="text-[16px] font-mono">⌘</span>
                         </div>
                         <h3 className={`text-[14px] font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Pending Approvals</h3>
                         <p className={`text-[12px] ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Operators have not submitted any costing vectors yet.</p>
                     </div>
                 )}
             </div>
          </div>
      </div>
    </div>
  );
}
