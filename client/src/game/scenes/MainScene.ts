import Phaser from "phaser";
import { Socket } from "socket.io-client";
import { LocalPlayer } from "../entities/LocalPlayer";
import { RemotePlayer } from "../entities/RemotePlayer";

export class MainScene extends Phaser.Scene {
  private socket: Socket;
  private localPlayer!: LocalPlayer;
  private otherPlayers: Map<string, RemotePlayer> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  constructor(socket: Socket) {
    super("MainScene");
    this.socket = socket;
  }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics
      .fillStyle(0x00ff00)
      .fillRect(0, 0, 32, 32)
      .generateTexture("player-tex", 32, 32);
    graphics
      .clear()
      .fillStyle(0xff0000)
      .fillRect(0, 0, 32, 32)
      .generateTexture("other-tex", 32, 32);
    graphics.destroy();
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D");

    // ⭐ Allow HTML inputs to receive keys (CHAT FIX)
    this.input.keyboard!.removeCapture("SPACE");
    this.input.keyboard!.removeCapture("W,A,S,D");

    this.localPlayer = new LocalPlayer(this, 0, 0);

    // Networking
    this.socket.on("currentPlayers", (players: any) => {
      Object.keys(players).forEach((id) => {
        if (id === this.socket.id) {
          this.localPlayer.sprite.setPosition(players[id].x, players[id].y);
        } else {
          this.spawnRemotePlayer(id, players[id].x, players[id].y);
        }
      });
    });

    this.socket.on("newPlayer", (data: any) =>
      this.spawnRemotePlayer(data.id, data.x, data.y),
    );

    this.socket.on("playerMoved", (data: any) => {
      const p = this.otherPlayers.get(data.id);
      if (p) {
        p.setPosition(data.x, data.y);
        p.setDepth(data.y);
      }
    });

    this.socket.on("playerDisconnected", (id: string) => {
      this.otherPlayers.get(id)?.destroy();
      this.otherPlayers.delete(id);
    });

    this.socket.on("newMessage", (data: any) =>
      this.showBubble(data.id, data.text),
    );
  }

  private spawnRemotePlayer(id: string, x: number, y: number) {
    if (this.otherPlayers.has(id)) return;
    this.otherPlayers.set(id, new RemotePlayer(this, id, x, y));
  }

  private showBubble(id: string, text: string) {
    const target =
      id === this.socket.id
        ? this.localPlayer.sprite
        : this.otherPlayers.get(id);
    if (!target) return;

    const bubble = this.add
      .text(target.x, target.y - 45, text, {
        fontSize: "14px",
        color: "#000",
        backgroundColor: "#fff",
        padding: { x: 8, y: 4 },
        wordWrap: { width: 160 },
      })
      .setOrigin(0.5, 1)
      .setDepth(3000);

    this.tweens.add({
      targets: bubble,
      y: target.y - 80,
      alpha: 0,
      duration: 4000,
      onComplete: () => bubble.destroy(),
    });
  }

  update() {
    this.localPlayer.update(this.cursors, this.wasd);

    const x = Math.round(this.localPlayer.sprite.x);
    const y = Math.round(this.localPlayer.sprite.y);
    if (x !== (this as any).lastSentX || y !== (this as any).lastSentY) {
      (this as any).lastSentX = x;
      (this as any).lastSentY = y;
      this.socket.emit("playerMove", { x, y });
    }
  }
}
