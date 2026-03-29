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
  const [debugState, setDebugState] = useState(true); // Toggle debug dots

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const requestRef = useRef(null);
  const garmentImageRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Initialize Pose Landmarker
  useEffect(() => {
    async function initPose() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        poseLandmarkerRef.current = landmarker;
        setLoading(false);
      } catch (err) {
        console.error("Failed to init MediaPipe:", err);
        setError("Could not initialize AR system. Please check your connection.");
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
    img.onload = () => {
      garmentImageRef.current = img;
    };
  }, [selectedGarment]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          // Set canvas dimensions to match actual camera resolution
          if (canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
          }
          requestRef.current = requestAnimationFrame(predictWebcam);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or device not found.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const ctx = canvasRef.current?.getContext("2d");
    ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const predictWebcam = () => {
    if (!videoRef.current || !poseLandmarkerRef.current || !canvasRef.current) return;

    const startTimeMs = performance.now();
    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
        lastVideoTimeRef.current = videoRef.current.currentTime;
        
        const results = poseLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        const ctx = canvasRef.current.getContext("2d");
        
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          
          // Shoulders (11, 12), Hips (23, 24)
          const lSh = landmarks[11];
          const rSh = landmarks[12];
          const lHp = landmarks[23];
          const rHp = landmarks[24];

          const w = canvasRef.current.width;
          const h = canvasRef.current.height;

          // Draw Debug Tracker Dots
          if (debugState) {
              ctx.fillStyle = "#3b82f6";
              [lSh, rSh, lHp, rHp].forEach(pt => {
                  ctx.beginPath();
                  ctx.arc(pt.x * w, pt.y * h, 5, 0, Math.PI * 2);
                  ctx.fill();
              });
          }

          // Calculate Torso Positioning
          // Midpoint of shoulders for X
          const midX = ((lSh.x + rSh.x) / 2) * w;
          // Midpoint of shoulder to hip for Y
          const neckY = ((lSh.y + rSh.y) / 2) * h;
          const hipY = ((lHp.y + rHp.y) / 2) * h;
          const torsoHeight = hipY - neckY;
          const midY = neckY + (torsoHeight * 0.45); // Centered on chest/belly

          // Scaling logic
          // Garment width based on shoulder distance with slack
          const shoulderDist = Math.abs(lSh.x - rSh.x) * w;
          const garmentWidth = shoulderDist * 2.2; 
          const garmentHeight = torsoHeight * 1.5;

          // Draw Garment
          if (garmentImageRef.current) {
            ctx.drawImage(
              garmentImageRef.current,
              midX - (garmentWidth / 2),
              neckY - (garmentHeight * 0.1), // Anchor near neck
              garmentWidth,
              garmentHeight
            );
          }
        }
        
        // HUD Overlay to show detection status
        ctx.fillStyle = results.landmarks && results.landmarks.length > 0 ? "#10b981" : "#ef4444";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(`AI Status: ${results.landmarks && results.landmarks.length > 0 ? "Tracking Locked (1)" : "Scanning for Person (0)"}`, 20, 30);
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className={`flex flex-col h-full antialiased pb-20 ${isDark ? 'text-prime-textDark' : 'text-prime-text'}`}>
      
      <div className="mb-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-[1500px]">
         <div>
             <h1 className={`text-[28px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Virtual Try-On 
             </h1>
             <p className={`text-[14px] mt-1 ${isDark ? 'text-prime-gray' : 'text-gray-500'}`}>
                AR Experience — Real-time body tracking and garment overlay
             </p>
         </div>
         <div className="flex gap-3 items-center">
             <button onClick={() => setDebugState(!debugState)} className={`text-[11px] px-3 py-1 rounded border ${isDark ? 'border-white/10 text-white/40' : 'border-black/5 text-black/40'}`}>
                {debugState ? "Disable Debug Mode" : "Enable Debug Mode"}
             </button>
             {!cameraActive ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                   onClick={startCamera} disabled={loading}
                   className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all disabled:opacity-50 shadow-sm text-white
                      ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                               : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}>
                   {loading ? "Initializing..." : "◎ Start Try-On"}
                </motion.button>
             ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                   onClick={stopCamera}
                   className={`flex items-center gap-2 px-7 py-2.5 font-semibold text-[13px] rounded-lg transition-all shadow-sm
                      ${isDark ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-red-50 text-red-600 border border-red-200'}`}>
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
                   ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                   
                   {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
                         <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dashed
                            ${isDark ? 'bg-[#18181b] border-[#3f3f46]' : 'bg-gray-50 border-gray-200'}`}>
                            <span className="text-[32px]">◎</span>
                         </div>
                         <h3 className={`text-[18px] font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Camera Ready</h3>
                         <p className={`text-[13px] max-w-[320px] ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>
                            Stand back and click "Start Try-On" to begin the AR experience. Your camera data stays local.
                         </p>
                      </div>
                   )}

                   <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
                      playsInline
                   />
                   <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-20 pointer-events-none" 
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
                {error && <p className="mt-4 text-red-500 text-sm font-medium">⚠️ {error}</p>}
             </div>

             {/* Catalog Sidebar */}
             <div className="xl:col-span-4 flex flex-col gap-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                   className={`p-7 rounded-2xl border shadow-sm h-full ${isDark ? 'bg-[#0a0a0a] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}`}>
                   <h3 className={`text-[15px] font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span>👕</span> Garment Catalog
                   </h3>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {GARMENTS.map((g) => (
                         <motion.button 
                            key={g.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedGarment(g)}
                            className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all
                               ${selectedGarment.id === g.id 
                                 ? (isDark ? 'bg-blue-500/10 border-blue-500' : 'bg-blue-50 border-blue-500 shadow-blue-500/10') 
                                 : (isDark ? 'bg-white/5 border-transparent hover:border-white/20' : 'bg-gray-50 border-transparent hover:border-gray-200')}`}
                         >
                            <div className="w-full aspect-square overflow-hidden rounded-lg mb-3">
                               <img src={g.image} alt={g.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <p className={`text-[11px] font-semibold text-center leading-tight truncate w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>{g.name}</p>
                            
                            {selectedGarment.id === g.id && (
                               <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-[10px]">✓</span>
                               </div>
                            )}
                         </motion.button>
                      ))}
                   </div>

                   <div className={`mt-10 p-5 rounded-xl border border-dashed ${isDark ? 'bg-[#18181b] border-[#27272a]' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-[11px] font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-[#a1a1aa]' : 'text-gray-600'}`}>
                         <span>💡</span> Pro Tip
                      </p>
                      <p className={`text-[12px] leading-relaxed ${isDark ? 'text-[#71717a]' : 'text-gray-500'}`}>
                         For the best experience, stand in a well-lit area about 2-3 meters from your camera. Wait for the blue dots to sync with your body.
                      </p>
                   </div>
                </motion.div>
             </div>

          </div>
      </div>
    </div>
  );
}
