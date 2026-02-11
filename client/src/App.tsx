import { useEffect, useRef, useState } from "react";
import { socket } from "./network/socket";
import { startGame } from "./game/main";
import { ChatLog } from "./components/ChatLog";
import { ChatInput } from "./components/ChatInput";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("newMessage", (msg) => {
      setChatLog((prev) => [...prev.slice(-14), msg]);
    });

    if (!gameRef.current) {
      gameRef.current = startGame(socket);
    }

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
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-sans p-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-yellow-500 tracking-tighter uppercase">
          Sprite Chatroom
        </h1>
        <div className="text-[10px] opacity-50 uppercase tracking-widest">
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      {/* Inside App.tsx return */}
      <div
        id="game-container"
        className="relative border-4 border-neutral-700 rounded-xl shadow-2xl overflow-hidden bg-black w-200 h-150"
      >
        {/* UI LAYER */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-start p-2">
          {/* Combined Chat Widget */}
          <div className="flex flex-col shadow-2xl">
            <ChatLog messages={chatLog} />

            {/* The Input box now has a flat top border if the log is open, or rounded if closed */}
            <div className="pointer-events-auto w-80 bg-black/80 border border-white/10 p-2 rounded-b-lg">
              <ChatInput
                ref={inputRef}
                message={message}
                setMessage={setMessage}
                onSubmit={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
