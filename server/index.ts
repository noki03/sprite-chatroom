import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

interface PlayerData {
  x: number;
  y: number;
  name: string;
  color: string;
  id: string;
}

const players: Record<string, PlayerData> = {};

io.on("connection", (socket) => {
  socket.on("joinGame", (userData: { name: string; color: string }) => {
    const newPlayer: PlayerData = {
      x: Math.floor(Math.random() * 600) + 100,
      y: Math.floor(Math.random() * 400) + 100,
      name: userData.name || "Guest",
      color: userData.color || "#ffffff",
      id: socket.id,
    };

    players[socket.id] = newPlayer;

    // Sync the new player and notify others
    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", newPlayer);

    io.emit("newMessage", {
      id: "SYSTEM",
      text: `${newPlayer.name} has joined the room.`,
      isSystem: true,
    });
  });

  // New listener: Allows Phaser to manually request the list if it missed the join broadcast
  socket.on("requestPlayers", () => {
    socket.emit("currentPlayers", players);
  });

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

  socket.on("chatMessage", (message: string) => {
    const player = players[socket.id];
    if (player) {
      io.emit("newMessage", {
        id: socket.id,
        name: player.name,
        color: player.color,
        text: message,
        isSystem: false,
      });
    }
  });

  socket.on("disconnect", () => {
    const player = players[socket.id];
    if (player) {
      io.emit("newMessage", {
        id: "SYSTEM",
        text: `${player.name} has left.`,
        isSystem: true,
      });
      delete players[socket.id];
      io.emit("playerDisconnected", socket.id);
    }
  });
});

httpServer.listen(3000, "0.0.0.0", () => console.log(`🚀 Server on port 3000`));
