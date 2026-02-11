import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows access from any device on your local network
    methods: ["GET", "POST"],
  },
});

const players: Record<string, { x: number; y: number }> = {};

io.on("connection", (socket) => {
  const shortId = socket.id.substring(0, 4);
  console.log(`User Joined: ${socket.id}`);

  // 1. Initialize player data
  players[socket.id] = {
    x: Math.floor(Math.random() * 600) + 100,
    y: Math.floor(Math.random() * 400) + 100,
  };

  // 2. Sync world state for the new player
  socket.emit("currentPlayers", players);

  // 3. Notify others of the new player (for the Phaser scene)
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  // 4. ⭐ SYSTEM MESSAGE: Announce join to the Chat Log
  io.emit("newMessage", {
    id: "SYSTEM",
    text: `User ${shortId} has joined the room.`,
    isSystem: true,
  });

  // Handle Movement
  socket.on("playerMove", (data: { x: number; y: number }) => {
    const player = players[socket.id];
    if (player) {
      player.x = data.x;
      player.y = data.y;
      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        x: data.x,
        y: data.y,
      });
    }
  });

  // Handle Chat
  socket.on("chatMessage", (message: string) => {
    console.log(`Chat from ${socket.id}: ${message}`);
    // io.emit sends to EVERYONE, including the sender
    io.emit("newMessage", {
      id: socket.id,
      text: message,
      isSystem: false,
    });
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`User Left: ${socket.id}`);
    delete players[socket.id];

    // Notify Phaser to remove the sprite
    io.emit("playerDisconnected", socket.id);

    // ⭐ SYSTEM MESSAGE: Announce departure to the Chat Log
    io.emit("newMessage", {
      id: "SYSTEM",
      text: `User ${shortId} has left the room.`,
      isSystem: true,
    });
  });
});

const PORT = 3000;
// Listening on 0.0.0.0 makes the server accessible via your Local IP
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Game Server reachable at http://172.20.20.116:${PORT}`);
});
