import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function Operator() {

  const [form, setForm] = useState({
    style: "",
    quantity: "",
    fabric1: "",
    fabric2: "",
    cmt: "",
    embellishments: "",
    trims: "",
    fpt: "",
    rejection: "1",
    markup: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculate = async () => {

    const base =
      (+form.fabric1 || 0) +
      (+form.fabric2 || 0) +
      (+form.cmt || 0) +
      (+form.embellishments || 0) +
      (+form.trims || 0) +
      (+form.fpt || 0);

    const adjusted = base * (+form.rejection || 1);
    const finalPerPiece = adjusted * (1 + (+form.markup || 0) / 100);
    const total = finalPerPiece * (+form.quantity || 0);

    const sendData = {
      style: form.style,
      quantity: +form.quantity,
      baseCost: base,
      finalPerPiece,
      total
    };

    try {
      await axios.post("http://localhost:5000/save", sendData);
    } catch (err) {
      console.log("Backend optional");
    }

    setResult({
      base: base.toFixed(2),
      finalPerPiece: finalPerPiece.toFixed(2),
      total: total.toFixed(2)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen p-12 dark:text-white"
    >

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-6">
          Product Costing Calculator
        </h1>

        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl">

          <div className="grid grid-cols-2 gap-8">

            {[
              ["Style Number", "style"],
              ["Quantity", "quantity"],
              ["Fabric 1 Cost", "fabric1"],
              ["Fabric 2 Cost", "fabric2"],
              ["CMT", "cmt"],
              ["Embellishments", "embellishments"],
              ["Trims", "trims"],
              ["FPT & GPT", "fpt"],
              ["Rejection Multiplier (1.05 = 5%)", "rejection"],
              ["Overheads + Markup %", "markup"]
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block text-sm mb-2">{label}</label>
                <input
                  name={name}
                  type={name === "style" ? "text" : "number"}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border dark:bg-gray-700"
                />
              </div>
            ))}

          </div>

          <button
            onClick={calculate}
            className="w-full mt-10 bg-black hover:bg-gray-900 text-white py-4 rounded-xl text-lg font-semibold"
          >
            Calculate Costing
          </button>

        </div>

        {result && (
          <div className="grid grid-cols-3 gap-6 mt-12">

            <Card title="Base Cost / Piece" value={result.base} />
            <Card title="Final Cost / Piece" value={result.finalPerPiece} />
            <Card title="Total Order Value" value={result.total} dark />

          </div>
        )}

      </div>

    </motion.div>
  );
}

function Card({ title, value, dark }) {
  return (
    <div className={`p-8 rounded-2xl ${dark ? "bg-black text-white" : "bg-white dark:bg-gray-800 shadow"}`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-bold mt-2">₹ {value}</p>
    </div>
  );
}
