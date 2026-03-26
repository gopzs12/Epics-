import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/marketplace")
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching marketplace:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto dark:text-white min-h-screen">
      <div className="flex justify-between items-center border-b pb-4 mb-6 dark:border-gray-700">
          <div>
              <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                ♻️ Upcycling Marketplace
              </h1>
              <p className="text-gray-500 mt-2">Connecting high-waste factory cuts with local NGOs, artisans, and recyclers.</p>
          </div>
      </div>

      {loading ? (
        <p>Loading available scraps...</p>
      ) : items.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 text-center rounded-xl border border-dashed border-gray-300">
           <p className="text-gray-500">No scrap materials currently available. Factory is highly efficient right now!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <motion.div 
               key={item._id || idx}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700 hover:shadow-lg transition"
            >
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold uppercase">{item.status || "Available"}</span>
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">Mixed Fabric Scraps</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Generated from low-efficiency cutting layout automatically listed by EPICS System.</p>
                
                <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                    <div>
                        <p className="text-xs text-gray-500">Est. Weight</p>
                        <p className="font-bold text-lg">{item.waste_kg} kg</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Suggested Price</p>
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">${item.suggested_price}</p>
                    </div>
                </div>
                
                <button className="w-full mt-4 bg-gray-900 dark:bg-gray-700 text-white py-2 rounded font-semibold hover:bg-black transition">
                    Contact Factory / Claim
                </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
