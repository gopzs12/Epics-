import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function AIAssistantWidget({ isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Enterprise Intelligence initialized. Awaiting parameters." }
  ]);
  const [inputText, setInputText] = useState("");
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const speak = (text) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processExternalAI = async (textInput) => {
      setIsTyping(true);
      try {
          const res = await axios.post("http://localhost:5000/api/chat", { message: textInput });
          const reply = res.data.reply;
          setMessages(prev => [...prev, { role: "ai", text: reply }]);
          speak(reply);
      } catch (err) {
          const fallback = "[ERR 503]: KNOWLEDGE BASE DISCONNECTED.";
          setMessages(prev => [...prev, { role: "ai", text: fallback }]);
      }
      setIsTyping(false);
  };

  const handleSendText = (e) => {
      e?.preventDefault();
      if (!inputText.trim()) return;
      
      const userMsg = inputText.trim();
      setInputText("");
      setMessages(prev => [...prev, { role: "user", text: userMsg }]);
      processExternalAI(userMsg);
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("System incompatibility detected.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessages(prev => [...prev, { role: "user", text: `>_ ${transcript}` }]);
      processExternalAI(transcript);
    };
    recognition.start();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
           <motion.div
             initial={{ opacity: 0, scale: 0.98, y: 10 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.98, y: 10 }}
             transition={{ duration: 0.2, ease: "easeOut" }}
             className={`fixed bottom-24 right-8 w-[380px] h-[600px] rounded-xl overflow-hidden z-[100] flex flex-col font-sans border shadow-2xl
                ${isDark ? 'bg-[#0a0a0a] border-[#27272a] shadow-[0_40px_80px_rgba(0,0,0,0.8)]' 
                         : 'bg-white border-[#e4e4e7] shadow-[0_20px_40px_rgba(0,0,0,0.1)]'}
             `}
           >
             {/* Subtle Inner Bevel */}
             <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>

             {/* Modal Header */}
             <div className="pt-5 pb-4 px-6 shrink-0 flex justify-between items-center border-b"
                  style={{ borderColor: isDark ? '#27272a' : '#e4e4e7' }}
             >
                 <div className="flex items-center gap-3">
                    <motion.div 
                       animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                       className={`w-9 h-9 rounded-full flex items-center justify-center text-[18px] shadow-sm
                        ${isDark ? 'bg-[#18181b] border border-[#3f3f46]' : 'bg-blue-50 border border-blue-200'}
                    `}>
                        🤖
                    </motion.div>
                    <div>
                        <h3 className={`font-semibold text-[14px] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Garment AI</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-prime-blue' : 'bg-blue-600'}`}></span>
                           <p className={`text-[11px] font-medium ${isDark ? 'text-[#a1a1aa]' : 'text-gray-500'}`}>Online & Ready</p>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-black/30'}`}>Voice</span>
                        <button 
                          onClick={() => {
                            setVoiceEnabled(!voiceEnabled);
                            if (voiceEnabled) window.speechSynthesis.cancel();
                          }} 
                          className={`relative w-10 h-5 rounded-full transition-all duration-300 border
                              ${voiceEnabled 
                                ? (isDark ? 'bg-blue-600/20 border-blue-500/50' : 'bg-blue-500 border-blue-400')
                                : (isDark ? 'bg-black border-[#27272a]' : 'bg-gray-100 border-gray-200')}
                          `}
                        >
                            <motion.div 
                                animate={{ x: voiceEnabled ? 20 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={`absolute top-1 w-2.5 h-2.5 rounded-full shadow-sm
                                    ${voiceEnabled ? 'bg-white' : (isDark ? 'bg-[#3f3f46]' : 'bg-gray-400')}
                                `}
                            />
                        </button>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-[16px] transition-colors
                          ${isDark ? 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}
                      `}
                    >
                        ×
                    </button>
                 </div>
              </div>

             {/* Chat List */}
             <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative z-10 w-full">
                {messages.map((msg, idx) => (
                   <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                      key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                   >
                      <div className={`max-w-[85%] px-4 py-3 text-[13px] font-medium leading-relaxed rounded-lg border
                          ${msg.role === 'user' 
                          ? (isDark ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/50 shadow-md rounded-tr-sm" 
                                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-sm rounded-tr-sm") 
                          : (isDark ? "bg-[#09090b] text-[#e4e4e7] border-[#27272a] shadow-sm rounded-tl-sm" 
                                    : "bg-white text-gray-800 border-[#e4e4e7] shadow-sm rounded-tl-sm")}
                      `}>
                         <span className={msg.role === 'ai' && isDark ? 'text-[13px] text-[#e4e4e7]' : ''}>
                             {msg.text}
                         </span>
                      </div>
                   </motion.div>
                ))}
                
                {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className={`px-4 py-3 rounded-lg border shadow-sm rounded-tl-sm flex items-center gap-1.5 h-[42px]
                          ${isDark ? 'bg-[#09090b] border-[#27272a]' : 'bg-white border-[#e4e4e7]'}
                      `}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-prime-blue' : 'bg-blue-500'}`}></span>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse delay-75 ${isDark ? 'bg-prime-blue' : 'bg-blue-500'}`}></span>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse delay-150 ${isDark ? 'bg-prime-blue' : 'bg-blue-500'}`}></span>
                      </div>
                    </motion.div>
                )}
                <div ref={endOfMessagesRef} />
             </div>

             {/* Enterprise Command Input */}
             <div className={`p-4 border-t ${isDark ? 'border-[#27272a] bg-[#09090b]' : 'border-[#e4e4e7] bg-[#fafafa]'}`}>
                 <form onSubmit={handleSendText} className="relative flex items-center w-full">
                    <button 
                       type="button" onMouseDown={startVoiceCommand}
                       className={`absolute left-3 w-6 h-6 rounded flex items-center justify-center transition-colors text-[14px]
                           ${listening ? (isDark ? "text-prime-blue animate-pulse" : "text-blue-600 animate-pulse") 
                                     : (isDark ? "text-[#71717a] hover:text-white" : "text-gray-400 hover:text-black")}
                       `}
                    >
                       🎙
                    </button>
                    
                    <input 
                       type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                       placeholder="Ask Garment AI..."
                       className={`w-full h-10 pl-10 pr-10 text-[13px] font-medium rounded-md focus:outline-none transition-colors border focus:ring-1 focus:ring-prime-blue 
                           ${isDark ? 'bg-black border-[#27272a] text-white placeholder-[#52525b] focus:border-prime-blue' 
                                    : 'bg-white border-[#e4e4e7] text-gray-900 placeholder-[#a1a1aa] focus:border-prime-blue'}
                       `}
                    />
                    
                    <AnimatePresence>
                      {inputText.trim() && (
                        <motion.button 
                           initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                           type="submit"
                           className={`absolute right-2 w-7 h-7 rounded flex items-center justify-center text-[12px] font-bold transition-all
                               ${isDark ? 'bg-prime-blue text-white hover:bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'}
                           `}
                        >
                           ↑
                        </motion.button>
                      )}
                    </AnimatePresence>
                 </form>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Cool Floating Robot Trigger Box */}
      <motion.button
         whileHover={{ y: -5, scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         animate={{ y: [0, -8, 0] }}
         transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
         onClick={() => setIsOpen(!isOpen)}
         className={`fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2
             ${isDark ? 'bg-gradient-to-br from-blue-600 to-indigo-800 border-indigo-400/30 text-white shadow-[0_10px_30px_rgba(37,99,235,0.4)]' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]'}
         `}
      >
         {isOpen ? (
             <span className="text-[24px] font-medium leading-none mb-1">×</span>
         ) : (
             <span className="text-[26px]">🤖</span>
         )}
      </motion.button>
    </>
  );
}
