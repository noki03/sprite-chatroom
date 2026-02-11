import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { socket } from "./network/socket";
import { startGame } from "./game/main";

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    // Connect ONCE for the tab
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      setSocketId(socket.id || "");
    });

    socket.on("disconnect", () => setIsConnected(false));

    // Start Phaser and GIVE it the socket
    if (!gameRef.current) {
      gameRef.current = startGame(socket);
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-black text-yellow-500 tracking-tighter uppercase">
          Sprite Chatroom
        </h1>
        <div className="text-xs opacity-60">
          STATUS:{" "}
          <span className={isConnected ? "text-green-400" : "text-red-500"}>
            {isConnected ? "● ONLINE" : "● OFFLINE"}
          </span>
          {isConnected && ` | SESSION: ${socketId.substring(0, 8)}`}
        </div>
      </div>

      <div
        id="game-container"
        className="border-4 border-neutral-700 rounded-lg shadow-2xl overflow-hidden bg-black"
        style={{ width: "800px", height: "600px" }}
      />

      <div className="mt-4 text-[10px] uppercase opacity-30 flex gap-10 font-bold">
        <span>WASD / ARROWS TO MOVE</span>
        <span>CHAT SYSTEM (IN DEVELOPMENT)</span>
      </div>
    </div>
  );
}

export default App;
