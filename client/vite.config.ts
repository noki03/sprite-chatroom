import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import os from "os";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Add this to the list
  ],

  server: {
    /* https: {
            key: fs.readFileSync("./cert/localhost+1-key.pem"),
            cert: fs.readFileSync("./cert/localhost+1.pem"),
        }, */
    host: "0.0.0.0",
    port: 5173,
    cors: {
      origin: "*",
    },
    hmr: {
      host: getLocalIP(), // dynamically resolved IP
      port: 5173,
    },
  },
});
