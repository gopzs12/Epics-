const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/garmentDB")
  .then(() => console.log("MongoDB Connected"));

const CostingSchema = new mongoose.Schema({
  style: String,
  quantity: Number,
  baseCost: Number,
  finalPerPiece: Number,
  total: Number,
  predictedPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

const Costing = mongoose.model("Costing", CostingSchema);

app.post("/save", async (req, res) => {

  // AI prediction logic
  const marginFactor = 1.12; // 12% AI suggested extra margin
  const predictedPrice = req.body.finalPerPiece * marginFactor;

  const costing = new Costing({
    ...req.body,
    predictedPrice
  });

  await costing.save();

  res.json({ message: "Saved", predictedPrice });
});

app.get("/all", async (req, res) => {
  const data = await Costing.find().sort({ createdAt: -1 });
  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
