import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import { Socket } from "socket.io-client";

export const startGame = (socket: Socket) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#1a1a1a",
    pixelArt: false,
    roundPixels: true,

    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    physics: {
      default: "arcade",
      arcade: {
        // Fix: Explicitly define both x and y to satisfy the Vector2Like interface
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [new MainScene(socket)],
  };

  return new Phaser.Game(config);
};
