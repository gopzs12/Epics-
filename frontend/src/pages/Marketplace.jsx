import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Marketplace({ isDark }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newListing, setNewListing] = useState({ material: "Cotton Blend Scraps", waste_kg: "", suggested_price: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = () => {
    fetch("http://localhost:5000/marketplace")
      .then(res => res.json())
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handlePost = async () => {
    if (!newListing.waste_kg || !newListing.suggested_price) return alert("Please fill in weight and price.");
    setSubmitting(true);
    try {
      await fetch("http://localhost:5000/marketplace-listing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newListing, status: "Available" })
      });
      setNewListing({ material: "Cotton Blend Scraps", waste_kg: "", suggested_price: "", description: "" });
      setShowForm(false);
      fetchListings();
    } catch (err) { alert("Error posting listing"); }
    setSubmitting(false);
  };

  const materials = ["Cotton Blend Scraps", "Polyester Offcuts", "Silk Remnants", "Denim Waste", "Wool Trimmings", "Nylon/Lycra Mix", "Linen Remnants"];

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      {/* Header */}
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1400px]">
         <div>
            <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
               ♻️ Upcycling Marketplace
            </h1>
            <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
               Buy and sell factory scrap materials. Connect with NGOs, artisans, and recyclers.
            </p>
         </div>
         <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all shadow-sm text-white
               ${isDark ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/20'}
            `}
         >
            {showForm ? "Cancel" : "+ List Scrap Material"}
         </motion.button>
      </div>

      <div className="flex-1 w-full max-w-[1400px]">
         
         {/* New Listing Form */}
         <AnimatePresence>
            {showForm && (
               <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className={`mb-8 p-8 rounded-xl border shadow-sm overflow-hidden
                     ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}
                  `}
               >
                  <h3 className={`text-[14px] font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Post a New Listing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                     <div className="flex flex-col">
                        <label className={`text-[12px] font-medium mb-1.5 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>Material Type</label>
                        <select value={newListing.material} onChange={e => setNewListing({...newListing, material: e.target.value})}
                           className={`rounded-lg px-3.5 h-10 text-[13px] font-medium outline-none appearance-none cursor-pointer
                              ${isDark ? 'bg-[#18181b] border border-[#27272a] text-white' : 'bg-[#fafafa] border border-[#e4e4e7] text-gray-900'}`}>
                           {materials.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </div>
                     <div className="flex flex-col">
                        <label className={`text-[12px] font-medium mb-1.5 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>Weight (kg)</label>
                        <input type="number" value={newListing.waste_kg} onChange={e => setNewListing({...newListing, waste_kg: e.target.value})} placeholder="0.0"
                           className={`rounded-lg px-3.5 h-10 text-[13px] font-medium outline-none focus:ring-2 focus:ring-green-500/40
                              ${isDark ? 'bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b]' : 'bg-[#fafafa] border border-[#e4e4e7] text-gray-900 placeholder-[#a1a1aa]'}`} />
                     </div>
                     <div className="flex flex-col">
                        <label className={`text-[12px] font-medium mb-1.5 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>Price (₹)</label>
                        <input type="number" value={newListing.suggested_price} onChange={e => setNewListing({...newListing, suggested_price: e.target.value})} placeholder="0.00"
                           className={`rounded-lg px-3.5 h-10 text-[13px] font-medium outline-none focus:ring-2 focus:ring-green-500/40
                              ${isDark ? 'bg-[#18181b] border border-[#27272a] text-white placeholder-[#52525b]' : 'bg-[#fafafa] border border-[#e4e4e7] text-gray-900 placeholder-[#a1a1aa]'}`} />
                     </div>
                     <div className="flex flex-col justify-end">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                           onClick={handlePost} disabled={submitting}
                           className={`h-10 rounded-lg font-semibold text-[13px] transition-all disabled:opacity-50 shadow-sm
                              ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                           {submitting ? "Posting..." : "Publish Listing"}
                        </motion.button>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Listings Grid */}
         {loading ? (
            <div className="flex items-center justify-center h-40">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className={`w-8 h-8 border-2 border-t-transparent rounded-full ${isDark ? 'border-white' : 'border-black'}`} />
            </div>
         ) : items.length === 0 ? (
            <div className={`rounded-xl p-16 text-center border border-dashed
               ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-gray-50/50 border-[#e4e4e7]'}
            `}>
               <div className={`w-14 h-14 border rounded-full mb-5 flex items-center justify-center opacity-30 mx-auto ${isDark ? 'border-[#3f3f46]' : 'border-[#d4d4d8]'}`}>
                  <span className="text-[18px]">♻️</span>
               </div>
               <h3 className={`text-[14px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Marketplace is Empty</h3>
               <p className={`text-[12px] max-w-sm mx-auto ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>
                  No scrap materials listed yet. Click "+ List Scrap Material" to post your factory's excess materials for NGOs and recyclers.
               </p>
            </div>
         ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, idx) => (
                <motion.div 
                   key={item._id || idx}
                   initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06, duration: 0.3 }}
                   whileHover={{ y: -4, transition: { duration: 0.2 } }}
                   className={`p-6 rounded-xl border shadow-sm transition-shadow hover:shadow-md
                      ${isDark ? 'bg-[#0a0a0a] border-[#27272a] hover:border-[#3f3f46]' : 'bg-white border-[#e4e4e7] hover:border-[#d4d4d8]'}
                   `}
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md
                           ${isDark ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-700 border border-green-200'}
                        `}>{item.status || "Available"}</span>
                        <span className={`text-[11px] ${isDark ? 'text-[#71717a]' : 'text-gray-400'}`}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Today"}</span>
                    </div>
                    
                    <h3 className={`text-[16px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.material || "Mixed Fabric Scraps"}</h3>
                    <p className={`text-[12px] leading-relaxed mb-5 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
                       {item.description || "Factory scrap material from cutting operations. Suitable for upcycling, recycling, or artisan crafts."}
                    </p>
                    
                    <div className={`flex justify-between items-center pt-4 border-t ${isDark ? 'border-[#27272a]' : 'border-[#e4e4e7]'}`}>
                        <div>
                            <p className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Weight</p>
                            <p className={`text-[18px] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.waste_kg} kg</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-[10px] font-medium uppercase tracking-wider ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>Price</p>
                            <p className="text-[18px] font-bold text-green-500">₹{item.suggested_price}</p>
                        </div>
                    </div>
                    
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                       className={`w-full mt-5 h-10 rounded-lg font-semibold text-[13px] transition-all shadow-sm
                          ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}
                       `}>
                        Contact Factory
                    </motion.button>
                </motion.div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}
