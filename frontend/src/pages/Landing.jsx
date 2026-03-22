import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1593032465171-8f4a62dbe5f0?auto=format&fit=crop&w=1920&q=80')"
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Floating Glow Blobs */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-20 left-20 w-72 h-72 bg-purple-600 opacity-30 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 opacity-30 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6"
      >

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-7xl font-extrabold text-white mb-6 tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"
        >
          Garment Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-12"
        >
          Smart Costing. Real-Time Analytics.  
          Next-Generation Manufacturing ERP.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            to="/login"
            className="px-12 py-4 bg-white text-black rounded-2xl font-semibold text-lg shadow-2xl hover:scale-105 hover:bg-gray-200 transition duration-300"
          >
            Get Started →
          </Link>
        </motion.div>

      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent" />

    </div>
  );
}
