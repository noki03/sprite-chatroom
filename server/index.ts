// server/index.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    // IMPORTANT: Allow your local IP or just use "*" for testing
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const players: Record<string, { x: number; y: number }> = {};

io.on("connection", (socket) => {
  console.log(`User Joined: ${socket.id}`);

  // 1. Randomize spawn so players don't overlap at (400, 300)
  players[socket.id] = {
    x: Math.floor(Math.random() * 600) + 100,
    y: Math.floor(Math.random() * 400) + 100,
  };

  // 2. Send current state to the new player
  socket.emit("currentPlayers", players);

  // 3. Tell others about the newcomer
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

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

  socket.on("disconnect", () => {
    console.log(`User Left: ${socket.id}`);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id); // Aggressive cleanup
  });
});

const PORT = 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Game Server reachable at http://172.20.20.116:${PORT}`);
});
