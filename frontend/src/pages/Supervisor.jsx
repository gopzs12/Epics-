import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function Supervisor() {

  const [records, setRecords] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/all")
      .then(res => setRecords(res.data))
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen p-12 dark:text-white"
    >

      <h1 className="text-4xl font-bold mb-10">
        Supervisor Analytics Dashboard
      </h1>

      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl mb-12">

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={records}>
            <XAxis dataKey="style" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#111827" />
          </BarChart>
        </ResponsiveContainer>

      </div>

      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl">

        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-gray-600">
              <th className="py-3">Style</th>
              <th>Quantity</th>
              <th>Final Per Piece</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="py-3">{r.style}</td>
                <td>{r.quantity}</td>
                <td>₹ {r.finalPerPiece?.toFixed(2)}</td>
                <td>₹ {r.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </motion.div>
  );
}
