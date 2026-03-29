import { useEffect, useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { motion, AnimatePresence } from "framer-motion";

const GARMENTS = [
  { id: "blue_tshirt", name: "Classic Blue T-Shirt", image: "/garments/blue_tshirt.png", type: "top" },
  { id: "red_polo", name: "Crimson Polo Shirt", image: "/garments/red_polo.png", type: "top" },
  { id: "black_shirt", name: "Midnight Formal Shirt", image: "/garments/black_shirt.png", type: "top" },
  { id: "white_top", name: "Studio Casual Top", image: "/garments/white_top.png", type: "top" },
];

export default function VirtualTryOn({ isDark }) {
  const [selectedGarment, setSelectedGarment] = useState(GARMENTS[0]);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [debugState, setDebugState] = useState(true); 
  const [aiStatus, setAiStatus] = useState("Initializing...");

  // Real-time Calibration Sliders
  const [sizeMultiplier, setSizeMultiplier] = useState(2.2);
  const [verticalOffset, setVerticalOffset] = useState(0.12);
  const sizeRef = useRef(2.2);
  const vOffsetRef = useRef(0.12);

  // Anti-Glitch / Jitter Prevention
  const smoothedLandmarksRef = useRef(null);
  const framesLostRef = useRef(0);

  // Sync state to refs for the requestAnimationFrame closure
  useEffect(() => { sizeRef.current = sizeMultiplier; }, [sizeMultiplier]);
  useEffect(() => { vOffsetRef.current = verticalOffset; }, [verticalOffset]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const garmentImageRef = useRef(null);
<<<<<<< Updated upstream
  const lastVideoTimeRef = useRef(-1);
=======
  const lastVideoTime = useRef(-1);
>>>>>>> Stashed changes

  // Initialize Pose Landmarker
  useEffect(() => {
    async function initPose() {
      setAiStatus("Loading WASM...");
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm"
        );
        setAiStatus("Loading Model...");
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
<<<<<<< Updated upstream
            delegate: "CPU"
=======
>>>>>>> Stashed changes
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        poseLandmarkerRef.current = landmarker;
        setAiStatus("A.I. Engine Ready");
        setLoading(false);
      } catch (err) {
        console.error("Failed to init MediaPipe:", err);
        setAiStatus("Error: Core Load Failed");
        setError("AI Engine failed to load. Check your internet connection.");
        setLoading(false);
      }
    }
    initPose();
    return () => {
      if (poseLandmarkerRef.current) poseLandmarkerRef.current.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Pre-load garment image whenever selected
  useEffect(() => {
    const img = new Image();
    img.src = selectedGarment.image;
    img.onload = () => { garmentImageRef.current = img; };
  }, [selectedGarment]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: "user" 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          // Auto-scale canvas once video starts
          if (canvasRef.current && videoRef.current.videoWidth > 0) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
          }
          requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
    setAiStatus("Camera Off");
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const predictWebcam = () => {
    if (!videoRef.current || !poseLandmarkerRef.current || !canvasRef.current) return;

<<<<<<< Updated upstream
    const startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        
        const results = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
=======
    // Detect if video frame has advanced
    if (videoRef.current.currentTime !== lastVideoTime.current && videoRef.current.readyState >= 2) {
        lastVideoTime.current = videoRef.current.currentTime;
        
        // Ensure canvas dimensions stay in sync with video
        if (canvasRef.current.width === 0 || canvasRef.current.width === 300) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
        }

        const results = poseLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());
>>>>>>> Stashed changes
        const ctx = canvasRef.current.getContext("2d");
        const w = canvasRef.current.width;
        const h = canvasRef.current.height;
        
        ctx.clearRect(0, 0, w, h);

        if (results.landmarks && results.landmarks.length > 0) {
<<<<<<< Updated upstream
          framesLostRef.current = 0; // Reset dropout counter
          const rawLandmarks = results.landmarks[0];
          
          if (!smoothedLandmarksRef.current) {
              // First valid frame, initialize smoothed skeleton
              smoothedLandmarksRef.current = JSON.parse(JSON.stringify(rawLandmarks));
          } else {
              // Apply Exponential Moving Average (EMA) to smooth out all tracking jitter
              const alpha = 0.35; // Lower is smoother but slower, 0.35 is perfectly snappy & stable
              for (let i = 0; i < rawLandmarks.length; i++) {
                  smoothedLandmarksRef.current[i].x += (rawLandmarks[i].x - smoothedLandmarksRef.current[i].x) * alpha;
                  smoothedLandmarksRef.current[i].y += (rawLandmarks[i].y - smoothedLandmarksRef.current[i].y) * alpha;
              }
          }
        } else {
          framesLostRef.current += 1; // Track how long we've been lost
        }

        // If we have a smoothed skeleton and haven't lost tracking for more than 30 frames (~0.5s)
        if (smoothedLandmarksRef.current && framesLostRef.current < 30) {
          const landmarks = smoothedLandmarksRef.current;
          
          // Shoulders (11, 12) - Clone them so we can modify without mutating the EMA state
          const lSh = { ...landmarks[11] };
          const rSh = { ...landmarks[12] };
          
          // EXPERIMENTAL FIX: Shift the shoulder joints UP by 5% to rest on the physical collarbones 
          // (trapezius) instead of inside the armpit joints where MediaPipe defaults them.
          lSh.y -= 0.05;
          rSh.y -= 0.05;

          const lHp = landmarks[23];
          const rHp = landmarks[24];

          // Points above the shoulder (0 = nose, 7/8 = ears)
          const nose = landmarks[0];
          const lEar = landmarks[7];
          const rEar = landmarks[8];

          const w = canvasRef.current.width;
          const h = canvasRef.current.height;

          // Midpoint logic
          const midX = ((lSh.x + rSh.x) / 2) * w;
          const neckY = ((lSh.y + rSh.y) / 2) * h;
          
          // Calculated neck base point
          const neckPoint = { x: (lSh.x + rSh.x) / 2, y: (lSh.y + rSh.y) / 2 };

          // Draw Debug Tracker Dots
          if (debugState) {
              ctx.fillStyle = "#3b82f6"; // Blue shoulders & hips
              [lSh, rSh, lHp, rHp].forEach(pt => {
=======
          setAiStatus("Tracking Body...");
          const landmarks = results.landmarks[0];

          // Draw Debug Tracker Dots (ALL 33 landmarks for diagnostic)
          if (debugState) {
              ctx.fillStyle = "#3b82f6"; // Blue
              ctx.strokeStyle = "white";
              ctx.lineWidth = 1;
              landmarks.forEach((pt, index) => {
>>>>>>> Stashed changes
                  ctx.beginPath();
                  ctx.arc(pt.x * w, pt.y * h, (index >= 11 && index <= 24) ? 6 : 3, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.stroke();
              });

              // Draw upper body points (green) above shoulders
              ctx.fillStyle = "#10b981"; 
              [nose, lEar, rEar, neckPoint].forEach(pt => {
                  if (pt) {
                      ctx.beginPath();
                      ctx.arc(pt.x * w, pt.y * h, 4, 0, Math.PI * 2);
                      ctx.fill();
                  }
              });
          }

<<<<<<< Updated upstream
=======
          // Core Processing for Layering
          const lSh = landmarks[11]; // Left Shoulder
          const rSh = landmarks[12]; // Right Shoulder
          const lHp = landmarks[23]; // Left Hip
          const rHp = landmarks[24]; // Right Hip

          // Positioning Logic (Centered on upper torso)
          const midX = ((lSh.x + rSh.x) / 2) * w;
          const neckY = ((lSh.y + rSh.y) / 2) * h;
>>>>>>> Stashed changes
          const hipY = ((lHp.y + rHp.y) / 2) * h;
          const torsoHeight = hipY - neckY;

<<<<<<< Updated upstream
          // Scaling logic
          const shoulderDist = Math.abs(lSh.x - rSh.x) * w;
          
          // Width based on user's manual slider via ref
          const garmentWidth = shoulderDist * sizeRef.current; 
          
          let garmentHeight = 0;
          if (garmentImageRef.current) {
               const aspectObj = garmentImageRef.current.height / garmentImageRef.current.width;
               garmentHeight = garmentWidth * aspectObj;
          }

          // Draw Garment
          if (garmentImageRef.current && garmentHeight > 0) {
            ctx.drawImage(
              garmentImageRef.current,
              midX - (garmentWidth / 2),
              neckY - (garmentHeight * vOffsetRef.current), // Anchor point based on manual vertical offset via ref
=======
          // Scaling (based on shoulder width)
          const shoulderDist = Math.abs(lSh.x - rSh.x) * w;
          const garmentWidth = shoulderDist * 2.6; 
          const garmentHeight = torsoHeight * 1.6;

          // Render Garment Layer
          if (garmentImageRef.current && garmentImageRef.current.complete) {
            ctx.drawImage(
              garmentImageRef.current,
              midX - (garmentWidth / 2),
              neckY - (garmentHeight * 0.18), // Anchor slightly above shoulders
>>>>>>> Stashed changes
              garmentWidth,
              garmentHeight
            );
          }
        } else {
            setAiStatus("Ready — No Body Detected");
        }
        
        // HUD Overlay to show detection status
        ctx.fillStyle = results.landmarks && results.landmarks.length > 0 ? "#10b981" : "#ef4444";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`AI Status: ${results.landmarks && results.landmarks.length > 0 ? "Tracking Locked (1)" : "Scanning for Person (0)"}`, 20, 30);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? "text-prime-textDark" : "text-prime-text"}`}>
      
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1500px]">
         <div>
             <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Virtual Try-On 
             </h1>
             <p className={`text-[14px] mt-1 ${isDark ? "text-prime-gray" : "text-gray-500"}`}>
                AR Experience — Real-time 33-point body tracking
             </p>
         </div>
         <div className="flex gap-4 items-center">
             <div className="flex flex-col items-end mr-2">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-white/20" : "text-black/20"}`}>Engine Status</span>
                <span className={`text-[12px] font-mono ${aiStatus.includes("Error") ? "text-red-500" : aiStatus.includes("Tracking") ? "text-green-500" : (isDark ? "text-blue-400" : "text-blue-600")}`}>
                    {aiStatus}
                </span>
             </div>
             {!cameraActive ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                   onClick={startCamera} disabled={loading}
                   className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all disabled:opacity-50 shadow-sm text-white
                      ${isDark ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                               : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20"}`}>
                   {loading ? "Initializing..." : "◎ Start Try-On"}
                </motion.button>
             ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                   onClick={stopCamera}
                   className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all shadow-sm
                      ${isDark ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-red-50 text-red-600 border border-red-200"}`}>
                   ⏹ Stop Camera
                </motion.button>
             )}
         </div>
      </div>

      <div className="flex-1 w-full max-w-[1500px]">
          <div className="grid xl:grid-cols-12 gap-8">
             
             {/* Preview Area */}
             <div className="xl:col-span-8">
                <div className={`relative w-full aspect-video rounded-3xl overflow-hidden border shadow-2xl
                   ${isDark ? "bg-[#0a0a0a] border-[#27272a]" : "bg-white border-[#e4e4e7]"}`}>
                   
                   {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
                         <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dashed
                            ${isDark ? "bg-[#18181b] border-[#3f3f46]" : "bg-gray-50 border-gray-200"}`}>
                            <span className="text-[32px]">◎</span>
                         </div>
                         <h3 className={`text-[18px] font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Camera Ready</h3>
                         <p className={`text-[13px] max-w-[320px] ${isDark ? "text-[#a1a1aa]" : "text-gray-500"}`}>
                            Stand back and click "Start Try-On" to begin. Your head, shoulders, and waist should be visible.
                         </p>
                      </div>
                   )}

                   <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
                      style={{ transform: "scaleX(-1)" }}
                      playsInline
                   />
                   <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none" 
                      style={{ transform: "scaleX(-1)" }}
                   />

                   {loading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                         <div className="flex flex-col items-center gap-4">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                               className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
                            <p className="text-white font-medium text-[14px]">Loading AI Graphics Engine...</p>
                         </div>
                      </div>
                   )}
                </div>
                {error && <p className="mt-4 text-red-500 text-sm font-medium bg-red-500/10 p-4 rounded-xl inline-block">⚠️ {error}</p>}
             </div>

             {/* Catalog Sidebar */}
             <div className="xl:col-span-4 flex flex-col gap-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                   className={`p-7 rounded-2xl border shadow-sm h-full ${isDark ? "bg-[#0a0a0a] border-[#27272a]" : "bg-white border-[#e4e4e7]"}`}>
                   <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-[15px] font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                         <span>👕</span> Garment Catalog
                      </h3>
                      <button onClick={() => setDebugState(!debugState)} className={`text-[10px] px-2 py-0.5 rounded border ${isDark ? "border-white/10 text-white/60" : "border-black/10 text-black/60"}`}>
                         {debugState ? "Hide Debug" : "Show Debug"}
                      </button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {GARMENTS.map((g) => (
                         <motion.button 
                            key={g.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedGarment(g)}
                            className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all
                               ${selectedGarment.id === g.id 
                                 ? (isDark ? "bg-blue-500/10 border-blue-500" : "bg-blue-50 border-blue-500 shadow-blue-500/10") 
                                 : (isDark ? "bg-white/5 border-transparent hover:border-white/20" : "bg-gray-50 border-transparent hover:border-gray-200")}`}
                         >
                            <div className="w-full aspect-square overflow-hidden rounded-lg mb-3">
                               <img src={g.image} alt={g.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <p className={`text-[11px] font-semibold text-center leading-tight truncate w-full ${isDark ? "text-white" : "text-gray-900"}`}>{g.name}</p>
                            
                            {selectedGarment.id === g.id && (
                               <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-[10px]">✓</span>
                               </div>
                            )}
                         </motion.button>
                      ))}
                   </div>

                   <div className={`mt-10 p-5 rounded-xl border border-dashed ${isDark ? "bg-[#18181b] border-[#27272a]" : "bg-gray-50 border-gray-200"}`}>
                      <p className={`text-[11px] font-medium mb-3 flex items-center gap-2 ${isDark ? "text-[#a1a1aa]" : "text-gray-600"}`}>
                         <span>💡</span> How to use
                      </p>
                      <ul className={`text-[11px] leading-relaxed space-y-2 ${isDark ? "text-[#71717a]" : "text-gray-500"}`}>
                        <li>1. Stand 2-3 meters away.</li>
                        <li>2. Ensure your upper body is fully visible.</li>
                        <li>3. Wait for the blue dots to align.</li>
                        <li>4. The A.I. Engine status should say <b>"Tracking Body..."</b>.</li>
                      </ul>
                   </div>

                   {/* AR Calibration Tools */}
                   {cameraActive && (
                     <div className={`mt-5 p-5 rounded-xl border ${isDark ? 'bg-black/20 border-[#27272a]' : 'bg-white border-gray-200 shadow-sm'}`}>
                       <p className={`text-[11px] font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
                          <span>⚙️</span> Live AR Calibration
                       </p>
                       
                       <div className="space-y-4">
                         <div>
                           <div className="flex justify-between mb-1.5">
                             <label className={`text-[10px] uppercase font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Garment Size</label>
                             <span className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{sizeMultiplier.toFixed(1)}x</span>
                           </div>
                           <input 
                             type="range" 
                             min="1.0" max="4.0" step="0.1"
                             value={sizeMultiplier}
                             onChange={(e) => setSizeMultiplier(parseFloat(e.target.value))}
                             className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           />
                         </div>

                         <div>
                           <div className="flex justify-between mb-1.5">
                             <label className={`text-[10px] uppercase font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Vertical Offset</label>
                             <span className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{verticalOffset.toFixed(2)}</span>
                           </div>
                           <input 
                             type="range" 
                             min="-0.3" max="0.5" step="0.02"
                             value={verticalOffset}
                             onChange={(e) => setVerticalOffset(parseFloat(e.target.value))}
                             className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                           />
                         </div>
                       </div>
                     </div>
                   )}
                </motion.div>
             </div>

          </div>
      </div>
    </div>
  );
}
