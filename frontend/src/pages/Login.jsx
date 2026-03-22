import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {

  const [name, setName] = useState("");
  const [role, setRole] = useState("operator");

  const handleLogin = () => {

    if (!name) return alert("Enter your name");

    const user = { name, role };
    localStorage.setItem("user", JSON.stringify(user));

    window.location.href = `/${role}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-12 dark:text-white"
    >

      <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-8 text-center">
          Welcome Back 👋
        </h1>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl border mb-6 dark:bg-gray-700"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-4 rounded-xl border mb-6 dark:bg-gray-700"
        >
          <option value="operator">Operator</option>
          <option value="supervisor">Supervisor</option>
        </select>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-4 rounded-xl hover:opacity-90 transition font-semibold"
        >
          Login
        </button>

      </div>

    </motion.div>
  );
}
