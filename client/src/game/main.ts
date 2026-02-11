import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import { Socket } from "socket.io-client";

export const startGame = (socket: Socket) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "game-container",
    backgroundColor: "#1a1a1a",
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: true,
      },
    },
    scene: [new MainScene(socket)],
  };

  return new Phaser.Game(config);
};
