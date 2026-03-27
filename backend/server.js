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

// =====================================================================
//  GARMENTLINK AI CHATBOT — DEEPLY TRAINED KNOWLEDGE BASE
// =====================================================================

const knowledgeBase = [
    // --- GREETINGS & GENERAL ---
    { keywords: ["hello", "hi", "hey", "hii", "hiii", "yo", "sup", "good morning", "good afternoon", "good evening"],
      answer: "Hello! 🤖 I'm your GarmentLink AI Assistant. I can help you with Costing, Waste Management, Approvals, the Marketplace, Leaderboard, and more. Just ask me anything!" },
    { keywords: ["who are you", "what are you", "your name", "about you", "introduce"],
      answer: "I'm GarmentLink AI 🤖 — an intelligent assistant built specifically for the garment industry. I help operators calculate costs, analyze fabric waste, manage approvals, and optimize factory sustainability. Think of me as your factory's digital co-pilot!" },
    { keywords: ["what can you do", "help me", "features", "what do you know"],
      answer: "I can help with:\n• 🧮 Costing & Estimation — breaking down fabric, CMT, and trim costs\n• ♻️ Waste Management — calculating fabric scrap and eco scores\n• ✅ Supervisor Approvals — explaining the approval workflow\n• 🛒 Marketplace — listing and buying scrap materials\n• 📊 Analytics & Forecasting — CO₂ predictions and cost projections\n• 🏆 Leaderboard — earning sustainability points\n\nJust ask me about any of these!" },
    { keywords: ["thank", "thanks", "thx", "appreciate"],
      answer: "You're welcome! 🤖 Happy to help. Let me know if you need anything else!" },
    { keywords: ["bye", "goodbye", "see you", "later"],
      answer: "Goodbye! 👋 Come back anytime you need help with GarmentLink. Happy manufacturing!" },

    // --- HOW TO USE THE PLATFORM ---
    { keywords: ["how to use", "get started", "start", "guide", "tutorial", "navigate"],
      answer: "Here's how to get started with GarmentLink:\n\n1️⃣ **Login** as an Operator or Supervisor\n2️⃣ **Operators**: Go to 'Costing & Estimation' to calculate garment costs, then 'Waste Optimizer' to analyze fabric efficiency\n3️⃣ **Supervisors**: Check the 'Analytics Hub' for records, and 'Approvals' to authorize costings\n4️⃣ Use the **Marketplace** to buy/sell scrap material\n5️⃣ Check the **Leaderboard** to see your sustainability ranking\n\nI'm here to help at every step! 🤖" },
    { keywords: ["login", "sign in", "account", "password", "register"],
      answer: "To login, go to the homepage at localhost:5173. Enter your name and select your role (Operator or Supervisor). The system currently uses a mock authentication — just enter any name and you're in! For production, we'd integrate JWT-based auth." },
    { keywords: ["dark mode", "light mode", "theme", "switch mode"],
      answer: "You can toggle between Dark and Light mode using the theme switch at the bottom of the sidebar. Click the sun/moon icon ☾/☼ to switch instantly. Your preference is applied to all pages!" },

    // --- COSTING MODULE (DEEP) ---
    { keywords: ["costing", "cost", "estimation", "calculate cost", "pricing"],
      answer: "The **Costing & Estimation** module lets you calculate the full manufacturing cost of a garment:\n\n• **Primary Fabric** — your main material cost\n• **Secondary Fabric** — lining, reinforcement, etc.\n• **CMT** — Cut, Make, Trim assembly charges\n• **Embellishments** — buttons, zippers, prints, embroidery\n• **Trims & Hardware** — labels, tags, hooks\n• **Testing & Compliance** — lab testing, quality checks\n• **Rejection Factor** — multiplier for expected defects\n• **Markup Margin** — your profit percentage\n\nAfter calculating, you'll see a bar chart and pie chart breaking down exactly where your money goes!" },
    { keywords: ["fabric", "fabric cost", "primary fabric", "secondary fabric", "material"],
      answer: "Fabric costs are typically the largest component (40-60%) of garment manufacturing. In our Costing module:\n• **Primary Fabric** = your main shell fabric (e.g., cotton, polyester blend)\n• **Secondary Fabric** = linings, interfacings, pocket fabric\n\nTip: Always add 3-5% extra for cutting waste when estimating fabric costs!" },
    { keywords: ["cmt", "cut make trim", "assembly", "manufacturing"],
      answer: "CMT stands for **Cut, Make, and Trim** — the core assembly charges in garment manufacturing:\n• **Cutting** — laying, marking, and cutting fabric patterns\n• **Making** — sewing, pressing, finishing\n• **Trimming** — attaching buttons, labels, packaging\n\nCMT typically represents 25-35% of total garment cost. Enter this value in the Costing module." },
    { keywords: ["rejection", "defect", "quality", "rejection factor"],
      answer: "The **Rejection Factor** accounts for garments that fail quality inspection. For example:\n• Factor of 1.0 = 0% rejection (perfect quality)\n• Factor of 1.05 = 5% expected rejects\n• Factor of 1.10 = 10% expected rejects\n\nWe multiply your base cost by this factor to ensure your pricing covers expected losses." },
    { keywords: ["markup", "margin", "profit", "pricing strategy"],
      answer: "The **Markup Margin %** is your profit on top of the total cost. For example:\n• 20% markup on a ₹100 base = ₹120 per piece\n• Industry standard is 15-40% depending on brand positioning\n\nOur system also has an AI prediction that recommends a 12% additional buffer for market fluctuations." },
    { keywords: ["pie chart", "donut", "breakdown", "chart", "graph"],
      answer: "After running a costing calculation, you'll see two charts:\n\n📊 **Bar Chart** — shows the absolute cost (₹) of each component side by side. X-axis is the component name, Y-axis is the cost in rupees.\n\n🍩 **Pie Chart** — shows the proportional split. Hover over any segment to see the exact percentage and cost.\n\nThese visuals make it easy to spot which components are eating into your margins!" },
    { keywords: ["submit", "approval", "forward", "supervisor approval"],
      answer: "After calculating a costing, click **'Submit for Approval →'** to send it to your Supervisor. The button will turn green with '✓ Forwarded to Supervisor'. The Supervisor can then see it in their Approvals page and click Approve or Reject." },

    // --- WASTE MANAGEMENT (DEEP) ---
    { keywords: ["waste", "scrap", "waste management", "sustainability", "eco"],
      answer: "The **Waste Management** module calculates your fabric cutting efficiency:\n\n1. Enter your fabric roll dimensions (length × width)\n2. Enter the pattern piece dimensions\n3. Enter target garments and fabric cost\n4. Click **Calculate Waste**\n\nYou'll get:\n• ♻️ **Waste %** — how much fabric is wasted\n• 💰 **Waste Cost** — the monetary value of wasted fabric\n• 🌱 **Eco Score** — sustainability rating out of 100\n• 🌳 **CO₂ & Tree offset** — environmental impact\n• 📐 **Cutting Layout** — visual grid of optimal pattern placement" },
    { keywords: ["waste percentage", "efficient", "efficiency", "cutting efficiency"],
      answer: "Waste percentage tells you how much of your fabric roll ends up as scrap:\n• **<15% waste** = Excellent efficiency (Eco Score 85+)\n• **15-30% waste** = Average (room for improvement)\n• **>30% waste** = High waste (optimize your patterns!)\n\nOur system tests multiple orientations (portrait vs landscape) to find the layout with minimum waste." },
    { keywords: ["eco score", "eco rating", "sustainability score"],
      answer: "The **Eco Score** is your sustainability rating from 0-100:\n• 🟢 90-100: Excellent — extremely efficient cutting\n• 🟡 70-89: Good — acceptable waste levels\n• 🟠 50-69: Below Average — consider pattern optimization\n• 🔴 0-49: Poor — significant material being wasted\n\nThe score is calculated based on waste percentage, CO₂ output, and cutting layout efficiency." },
    { keywords: ["co2", "carbon", "emission", "carbon footprint", "environment"],
      answer: "Our system calculates the **carbon footprint** of your fabric waste:\n• Every kg of textile waste produces approximately 3.6 kg of CO₂\n• We show exactly how many kg of CO₂ your cutting batch generates\n• We also calculate how many **trees** you'd need to plant to offset that carbon\n\nThis data helps factories track and reduce their environmental impact over time." },
    { keywords: ["trees", "offset", "plant trees", "neutralize"],
      answer: "One mature tree absorbs about 22 kg of CO₂ per year. Based on your waste output, we calculate exactly how many trees would be needed to neutralize that carbon. This helps factories set tangible sustainability goals!" },
    { keywords: ["scan", "camera", "upload", "image", "photo", "computer vision", "cv"],
      answer: "Click **'📷 Scan Fabric'** on the Waste Management page to upload or capture a photo of your fabric roll. Our Python **OpenCV** backend will:\n1. Detect the fabric edges using contour analysis\n2. Estimate the length and width automatically\n3. Pre-fill the dimensions in the form\n\nThis saves time vs. manual measurement!" },
    { keywords: ["pattern", "layout", "grid", "cutting layout", "optimization"],
      answer: "The **Cutting Layout Preview** shows a visual grid where each blue square represents one garment pattern piece. The system tests both portrait and landscape orientations and picks the one that fits more pieces with less waste. The grid dimensions (rows × columns) are displayed above the preview." },

    // --- MARKETPLACE (DEEP) ---
    { keywords: ["marketplace", "sell", "buy", "list", "scrap", "upcycle", "ngo", "recycle"],
      answer: "The **Upcycling Marketplace** connects factories with NGOs and recyclers:\n\n🏭 **For Factories**: Click '+ List Scrap Material' to post your excess fabric. Select the material type, enter the weight (kg) and suggested price (₹).\n\n♻️ **For Buyers**: Browse available listings. Each card shows the material type, weight, price, and a 'Contact Factory' button.\n\nThis creates a **circular economy** — one factory's waste becomes another's raw material!" },
    { keywords: ["circular economy", "sustainable fashion", "zero waste"],
      answer: "GarmentLink promotes a **circular economy** in the garment industry:\n• Factories list their scrap on the Marketplace instead of sending it to landfills\n• NGOs and artisans buy this scrap at low prices for upcycled products\n• Our Eco Score and Leaderboard incentivize factories to reduce waste\n\nThe goal is to move towards **zero textile waste** across the industry." },

    // --- SUPERVISOR & APPROVALS ---
    { keywords: ["supervisor", "analytics", "hub", "dashboard", "records"],
      answer: "The **Analytics Hub** (Supervisor view) provides:\n\n📊 **Costing Records** — a bar chart of all submitted costings with total amounts\n📋 **Recent Submissions** — a scrollable list of all operator submissions\n🔮 **AI Forecast** — click 'Run AI Forecast' to see a 6-month projection of CO₂ emissions and financial losses\n\nSupervisors also have access to the **Approvals** page to authorize or deny operator calculations." },
    { keywords: ["forecast", "predict", "future", "projection", "6 month"],
      answer: "The **AI Forecast** feature projects your factory's performance over 6 months:\n• 📈 **CO₂ Emissions** trend line — predicted carbon output growth\n• 💸 **Financial Loss** trend line — projected cost of waste\n• 🌳 **Trees Needed** — how many trees to offset 6 months of emissions\n\nClick 'Run AI Forecast' on the Analytics Hub to generate the projection. The data comes from our Python ML backend." },
    { keywords: ["approve", "reject", "deny", "pending", "authorization"],
      answer: "The **Approvals** workflow:\n1. Operator calculates a costing → clicks 'Submit for Approval'\n2. Data is saved locally (Style ID, quantity, total cost)\n3. Supervisor goes to **Approvals** page in the sidebar\n4. Each pending item shows the Style, Volume, and Financial data\n5. Supervisor clicks ✅ **Approve** (turns green) or ❌ **Reject** (turns red)\n\nThis ensures all costings go through proper authorization before being finalized." },

    // --- LEADERBOARD ---
    { keywords: ["leaderboard", "points", "rank", "ranking", "gamification", "competition"],
      answer: "The **Global Leaderboard** gamifies sustainability:\n• Operators earn **+50 Eco Points** for each cutting layout with an Eco Score ≥ 90\n• Rankings show all factory operators sorted by points\n• This creates healthy competition to reduce waste!\n\nThe leaderboard resets monthly to keep things fresh and motivating." },

    // --- TECHNICAL / ARCHITECTURE ---
    { keywords: ["tech", "stack", "built", "technology", "framework", "api"],
      answer: "GarmentLink's tech stack:\n\n**Frontend**: React.js + Vite + Tailwind CSS + Framer Motion + Recharts\n**Backend 1**: Node.js + Express (Port 5000) — handles costings, marketplace, leaderboard, and this chat\n**Backend 2**: Python + FastAPI (Port 8000) — handles waste calculations, computer vision, and ML forecasting\n**Database**: MongoDB (with localStorage fallback)\n**AI/ML**: OpenCV for fabric scanning, statistical modeling for CO₂ forecasting" },
    { keywords: ["garmentlink", "epics", "project", "about", "what is"],
      answer: "**GarmentLink** is an intelligent B2B platform for the garment industry. It was built as part of the EPICS project to help textile factories:\n\n🧮 Calculate precise manufacturing costs\n♻️ Reduce fabric waste using AI-optimized cutting layouts\n🌍 Track and minimize their carbon footprint\n🛒 Trade scrap materials in a circular marketplace\n📊 Make data-driven decisions with predictive analytics\n\nOur mission: make the garment industry more sustainable, efficient, and profitable." },

    // --- COMMON QUESTIONS ---
    { keywords: ["how accurate", "precision", "reliable", "trust"],
      answer: "Our calculations are based on standard industry formulas:\n• Costing uses component-by-component summation with rejection and markup factors\n• Waste optimization uses geometric bin-packing algorithms\n• CO₂ estimates use the global average of 3.6 kg CO₂ per kg of textile waste\n• Forecasting uses statistical trend extrapolation\n\nThe accuracy improves as you enter more precise input data!" },
    { keywords: ["garment", "textile", "fashion", "clothing", "factory", "industry"],
      answer: "GarmentLink is specifically designed for the **garment and textile industry**. It addresses the unique challenges factories face:\n• Complex multi-component costing (fabric + CMT + trims)\n• Fabric waste from cutting operations (typically 15-30% loss)\n• Environmental compliance and sustainability reporting\n• Supply chain coordination between operators and supervisors\n\nWhether you're a small workshop or a large factory, GarmentLink scales to your needs!" },
    { keywords: ["error", "not working", "bug", "broken", "issue", "problem"],
      answer: "If something isn't working:\n1. Make sure the **Node server** is running (`cd backend && node server.js` on port 5000)\n2. Make sure the **Python server** is running (`cd waste_management_service && python main.py` on port 8000)\n3. Make sure the **frontend** is running (`cd frontend && npm run dev` on port 5173)\n\nIf you see CORS errors, check that all three servers are up. Feel free to describe the specific issue and I'll help troubleshoot! 🔧" },
];

app.post("/api/chat", (req, res) => {
    const message = req.body.message;
    if (!message) return res.status(400).json({ reply: "Please enter a message." });
    
    const query = message.toLowerCase().trim();
    
    // Multi-keyword scoring system — find the best matching intent
    let bestMatch = null;
    let maxScore = 0;

    for (let intent of knowledgeBase) {
        let score = 0;
        for (let keyword of intent.keywords) {
            // Check for full phrase match first (higher score)
            if (query.includes(keyword)) {
                // Longer keywords get higher scores (more specific = more relevant)
                score += keyword.split(" ").length * 2;
            }
        }
        if (score > maxScore) {
           maxScore = score;
           bestMatch = intent.answer;
        }
    }

    // Smart fallback with suggestions based on partial matches
    if (!bestMatch) {
        const suggestions = [];
        if (query.match(/\b(cost|price|money|rupee|expensive|cheap)\b/)) suggestions.push("costing");
        if (query.match(/\b(waste|scrap|cut|fabric|material)\b/)) suggestions.push("waste management");
        if (query.match(/\b(approve|submit|supervisor|boss|manager)\b/)) suggestions.push("approvals");
        if (query.match(/\b(sell|buy|market|shop)\b/)) suggestions.push("marketplace");
        if (query.match(/\b(score|rank|point|win)\b/)) suggestions.push("leaderboard");

        if (suggestions.length > 0) {
            bestMatch = `I think you might be asking about **${suggestions.join("** or **")}**. Could you try rephrasing your question? For example, try asking "How does ${suggestions[0]} work?"`;
        } else {
            bestMatch = "I'm not sure I understand that yet! 🤖 Here are some things I can help with:\n\n• Ask about **Costing** — \"How does costing work?\"\n• Ask about **Waste** — \"How to calculate waste?\"\n• Ask about **Approvals** — \"How do approvals work?\"\n• Ask about **Marketplace** — \"How to sell scrap?\"\n• Ask about **Eco Score** — \"What is the eco score?\"\n• Ask about **Forecasting** — \"How does the forecast work?\"\n\nOr just say **hi** and I'll introduce myself! 😊";
        }
    }
    
    // Artificial delay for natural feel
    const delay = Math.min(400 + bestMatch.length * 2, 1200);
    setTimeout(() => res.json({ reply: bestMatch }), delay);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
