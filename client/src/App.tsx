import { useEffect, useRef, useState } from "react";
import { socket } from "./network/socket";
import { startGame } from "./game/main";
import { ChatLog } from "./components/ChatLog";
import { ChatInput } from "./components/ChatInput";
import { UserList } from "./components/UserList";
import { JoinScreen } from "./components/JoinScreen";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<any[]>([]);
  const [playerList, setPlayerList] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("newMessage", (msg) => {
      setChatLog((prev) => [...prev.slice(-14), msg]);
    });

    socket.on("currentPlayers", (players) => {
      setPlayerList(players);
    });

    socket.on("newPlayer", (data) => {
      setPlayerList((prev) => ({ ...prev, [data.id]: data }));
    });

    socket.on("playerDisconnected", (id) => {
      setPlayerList((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    });

    // Start Phaser only when joined
    if (hasJoined && !gameRef.current) {
      gameRef.current = startGame(socket);
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!hasJoined) return;
      if (e.key === "Enter" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newMessage");
      socket.off("currentPlayers");
      socket.off("newPlayer");
      socket.off("playerDisconnected");
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [hasJoined]);

  const handleJoin = (name: string, color: string) => {
    // 1. Tell server we are joining
    socket.emit("joinGame", { name, color });

    // 2. We wait 800ms so the user actually sees the "Joining..." animation
    // and Phaser has a head start to initialize.
    setTimeout(() => {
      setHasJoined(true);
    }, 800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
    inputRef.current?.blur();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white font-sans p-4 overflow-hidden">
      {/* JOIN SCREEN 
         Notice: We keep it rendered until hasJoined is true. 
         Internal state in JoinScreen handles the spinner.
      */}
      {!hasJoined && <JoinScreen onJoin={handleJoin} />}

      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-yellow-500 tracking-tighter uppercase">
          Sprite Chatroom
        </h1>
        <div className="text-[10px] opacity-50 uppercase tracking-widest">
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>

      <div className="flex gap-4 items-start animate-in fade-in zoom-in duration-700">
        <div
          id="game-container"
          onMouseDown={() => inputRef.current?.blur()}
          className="relative border-4 border-neutral-700 rounded-xl shadow-2xl overflow-hidden bg-black w-200 h-150"
        >
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

        <div className="w-48">
          <UserList players={playerList} localId={socket.id} />
        </div>
      </div>
    </div>
  );
}

export default App;
