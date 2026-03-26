import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I am your EPICS Eco Assistant. How can I guide you today?" }
  ]);
  const [listening, setListening] = useState(false);
  
  const location = useLocation();
  const endOfMessagesRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Context-aware greeting based on the page navigation!
  useEffect(() => {
    if (!isOpen) return;
    
    let contextMessage = "";
    if (location.pathname === "/waste-management") {
      contextMessage = "I see you're on the Waste Calculator. Let me know if you want me to scan a fabric image for you!";
    } else if (location.pathname === "/marketplace") {
      contextMessage = "Welcome to the Upcycling Marketplace. These are local fabric scraps available for community use.";
    } else if (location.pathname === "/leaderboard") {
      contextMessage = "Check out the top Eco Warriors! Save fabric to rank up.";
    } else if (location.pathname === "/operator") {
      contextMessage = "You're at the Costing Dashboard. I can help calculate margins here.";
    } else if (location.pathname === "/supervisor") {
      contextMessage = "Welcome to the Analytics Command Center. Review all predictive forecasting here.";
    }

    if (contextMessage) {
       setTimeout(() => {
           setMessages(prev => [...prev, { role: "ai", text: contextMessage }]);
           speak(contextMessage);
       }, 1000);
    }
  }, [location.pathname, isOpen]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear queue
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support Voice APIs natively.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => [...prev, { role: "user", text: transcript }]);
      processAIResponse(transcript.toLowerCase());
    };

    recognition.start();
  };

  const processAIResponse = (input) => {
      let reply = "I logged your command. Our NLP processing is learning your factory's specific jargon!";
      
      if (input.includes("calculate") || input.includes("cost")) {
          reply = "Navigate to the Costing tab to run structure predictions.";
      } else if (input.includes("tree") || input.includes("environment") || input.includes("co2")) {
          reply = "You can view your total environmental impact on the Analytics page or Waste calculator.";
      } else if (input.includes("hello") || input.includes("hi")) {
          reply = "Hi there! Ready to optimize some fabric?";
      }

      setTimeout(() => {
          setMessages(prev => [...prev, { role: "ai", text: reply }]);
          speak(reply);
      }, 500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, filter: "blur(10px)" }}
            className="fixed bottom-24 right-8 w-80 md:w-96 bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 shadow-2xl rounded-[2rem] overflow-hidden z-[100]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 shrink-0 flex justify-between items-center text-white">
                <div>
                   <h3 className="font-bold tracking-wide">EPICS Assistant</h3>
                   <p className="text-xs text-white/70 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                   </p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition"
                >
                    ✕
                </button>
            </div>

            {/* Chat Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                         msg.role === 'user' 
                         ? "bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-none" 
                         : "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-tl-none shadow-sm"
                     }`}>
                        {msg.text}
                     </div>
                  </div>
               ))}
               <div ref={endOfMessagesRef} />
            </div>

            {/* Input Hook */}
            <div className="p-4 border-t dark:border-gray-800 bg-white/50 dark:bg-black/50">
               <button 
                  onClick={startVoiceCommand}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                      listening 
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
               >
                  {listening ? "🎙️ Listening..." : "🗣️ Tap to Speak"}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
         whileHover={{ scale: 1.1, rotate: 5 }}
         whileTap={{ scale: 0.9 }}
         onClick={() => setIsOpen(!isOpen)}
         className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center text-2xl border-2 border-white/20"
      >
         {isOpen ? "×" : "✨"}
      </motion.button>
    </>
  );
}
