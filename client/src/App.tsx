import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { socket } from "./network/socket";
import { startGame } from "./game/main";

interface ChatEntry {
  id: string;
  text: string;
}

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Connect Socket
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 2. Listen for chat messages for the UI log
    socket.on("newMessage", (msg: ChatEntry) => {
      setChatLog((prev) => [...prev.slice(-9), msg]); // Keep last 10 messages
    });

    // 3. Start Phaser
    if (!gameRef.current) {
      gameRef.current = startGame(socket);
    }

    // 4. Global keyboard shortcut: Press 'Enter' to focus chat
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      socket.off("newMessage");
      socket.disconnect();
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
      inputRef.current?.blur(); // Release focus so player can move again
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-sans p-4">
      {/* Header Info */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black text-yellow-500 tracking-tighter uppercase">
          Sprite Chatroom
        </h1>
        <div className="text-[10px] opacity-50 uppercase tracking-widest">
          Status: {isConnected ? "🟢 Online" : "🔴 Offline"} | IP: 172.20.20.116
        </div>
      </div>

      {/* Game Wrapper */}
      <div
        id="game-container"
        className="relative border-4 border-neutral-700 rounded-xl shadow-2xl overflow-hidden bg-black"
        style={{ width: "800px", height: "600px" }}
      >
        {/* REACT CHAT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-end">
          {/* Chat Log Display */}
          <div className="flex flex-col gap-1 mb-4 overflow-hidden">
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className="bg-black/40 self-start px-3 py-1 rounded-full text-sm border border-white/5 backdrop-blur-sm animate-in slide-in-from-left duration-300"
              >
                <span className="text-yellow-400 font-bold mr-2">
                  {msg.id.substring(0, 4)}:
                </span>
                <span className="text-white/90">{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="pointer-events-auto">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Press Enter to type..."
              className="w-full bg-black/80 border-2 border-white/10 px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-500 text-white transition-all shadow-xl"
              maxLength={50}
            />
          </form>
        </div>
      </div>

      <div className="mt-4 flex gap-8 opacity-30 text-[10px] font-bold uppercase tracking-widest">
        <span>WASD to Move</span>
        <span>Enter to Chat</span>
      </div>
    </div>
  );
}

export default App;
