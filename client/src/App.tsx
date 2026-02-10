import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to your Node.js server
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Game Server!");
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        color: "white",
        background: "#222",
        height: "100vh",
      }}
    >
      <h1 className="font-sans text-game-gold">Connection Test</h1>
      <p>Status: {isConnected ? "🟢 Online" : "🔴 Offline"}</p>
      {isConnected && <p>Your ID: {socket?.id}</p>}
      <div id="game-container">
        {/* Phaser will inject the game here later */}
      </div>
    </div>
  );
}

export default App;
