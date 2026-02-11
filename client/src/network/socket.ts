import { io, Socket } from "socket.io-client";

const SERVER_IP = "172.20.20.116";

export const socket: Socket = io(`http://${SERVER_IP}:3000`, {
  transports: ["websocket"],
  autoConnect: false, // React controls when to connect
});
