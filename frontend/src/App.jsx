import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Operator from "./pages/Operator";
import Supervisor from "./pages/Supervisor";
import Profile from "./pages/profile.jsx";
import Loader from "./components/loader.jsx";

export default function App() {

  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // Dark Mode
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // Loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

      {/* Navbar */}
      <div className="flex justify-between items-center p-6">

        <div className="flex gap-6 items-center">
          <Link to="/" className="font-bold text-xl dark:text-white">
            GarmentERP
          </Link>

          {user && (
            <>
              <Link to={`/${user.role}`} className="dark:text-white">
                Dashboard
              </Link>

              <Link to="/profile" className="dark:text-white">
                Profile
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl text-sm"
        >
          {dark ? "Light Mode" : "Dark Mode"}
        </button>

      </div>

      {/* Animated Routes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/operator" element={<Operator />} />
            <Route path="/supervisor" element={<Supervisor />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
