const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/garmentDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("⚠️ MongoDB Not Running locally (which is fine for the prototype)! Running Node server anyway..."));

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

// EPICS - Mock Marketplace Array (so you don't need a real Database installed to demo it!)
let mockMarketplace = [];

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

// EPICS Marketplace Endpoints
app.post("/marketplace-listing", (req, res) => {
    const listing = { ...req.body, _id: Date.now(), createdAt: new Date() };
    mockMarketplace.unshift(listing);
    res.json({ message: "Listed on Marketplace successfully", id: listing._id });
});

app.get("/marketplace", (req, res) => {
    res.json(mockMarketplace);
});

// EPICS Points Emulator
let mockLeaderboard = [{ name: "Operator 1", points: 450 }, { name: "Operator 2", points: 300 }];
app.post("/award-points", (req, res) => {
    // Emulating point distribution
    const bonus = req.body.points || 50;
    mockLeaderboard[0].points += bonus;
    res.json({ message: `Awarded ${bonus} points!`, lb: mockLeaderboard });
});

app.get("/leaderboard", (req, res) => {
    res.json(mockLeaderboard.sort((a,b) => b.points - a.points));
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
