import { useEffect, useRef, useState } from "react";
import { socket } from "./network/socket";
import { startGame } from "./game/main";
import { ChatLog } from "./components/ChatLog";
import { ChatInput } from "./components/ChatInput";
import { UserList } from "./components/UserList";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [playerList, setPlayerList] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("newMessage", (msg) => {
      setChatLog((prev) => [...prev.slice(-14), msg]);
    });

    socket.on("currentPlayers", (players) => setPlayerList(players));
    socket.on("newPlayer", (data) =>
      setPlayerList((prev) => ({ ...prev, [data.id]: data })),
    );
    socket.on("playerDisconnected", (id) => {
      setPlayerList((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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
      socket.off("currentPlayers");
      socket.off("newPlayer");
      socket.off("playerDisconnected");
      socket.disconnect();
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
    inputRef.current?.blur();
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

      {/* Main Layout Wrapper: Side by Side */}
      <div className="flex gap-4 items-start">
        {/* GAME CONTAINER - Using Canonical classes w-200 (800px) and h-150 (600px) */}
        <div
          id="game-container"
          onMouseDown={() => inputRef.current?.blur()}
          className="relative border-4 border-neutral-700 rounded-xl shadow-2xl overflow-hidden bg-black w-200 h-150"
        >
          {/* UI LAYER (Internal to Canvas for Chat only) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-end items-start p-2">
            <div className="flex flex-col shadow-2xl">
              <ChatLog messages={chatLog} localId={socket.id} />
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

        {/* SIDEBAR: User List outside the game canvas */}
        <div className="w-48">
          <UserList players={playerList} localId={socket.id} />
        </div>
      </div>
    </div>
  );
}

export default App;
