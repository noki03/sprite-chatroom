import Phaser from "phaser";
import { Socket } from "socket.io-client";
import { PlayerManager } from "../handlers/PlayerManager";
import { ChatBubbleManager } from "../handlers/ChatBubbleManager";

export class MainScene extends Phaser.Scene {
  private socket: Socket;
  private players: PlayerManager;
  private bubbles: ChatBubbleManager;

  // Store controls as properties so update() can use them without re-declaring
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;

  private lastSentX = 0;
  private lastSentY = 0;

  constructor(socket: Socket) {
    super("MainScene");
    this.socket = socket;
    this.players = new PlayerManager(this);
    this.bubbles = new ChatBubbleManager(this);
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
    // Initialize controls ONCE
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D");

    this.input.keyboard!.removeCapture("SPACE,W,A,S,D");
    this.players.spawnLocal(0, 0);

    // --- Network Events ---
    this.socket.on("currentPlayers", (data) => {
      Object.keys(data).forEach((id) => {
        if (id === this.socket.id) {
          this.players.localPlayer.sprite.setPosition(data[id].x, data[id].y);
        } else {
          this.players.spawnRemote(id, data[id].x, data[id].y);
        }
      });
    });

    this.socket.on("newPlayer", (data) =>
      this.players.spawnRemote(data.id, data.x, data.y),
    );

    this.socket.on("playerMoved", (data) => {
      const p = this.players.remotePlayers.get(data.id);
      if (p) {
        p.setPosition(data.x, data.y);
        p.setDepth(data.y);
      }
    });

    this.socket.on("playerDisconnected", (id) => {
      this.players.removePlayer(id);
      this.bubbles.removeBubble(id);
    });

    this.socket.on("newMessage", (data) => {
      if (data.id === "SYSTEM") return;
      const target = this.players.getPlayer(data.id, this.socket.id!);
      if (target) this.bubbles.showBubble(data.id, target, data.text);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.socket.off());
  }

  update() {
    const { localPlayer } = this.players;

    // Use the class properties instead of declaring new variables
    localPlayer.update(this.cursors, this.wasd);

    // Sync Bubbles
    this.bubbles.update((id) => this.players.getPlayer(id, this.socket.id!));

    // Network Sync
    const x = Math.round(localPlayer.sprite.x);
    const y = Math.round(localPlayer.sprite.y);

    if (x !== this.lastSentX || y !== this.lastSentY) {
      this.lastSentX = x;
      this.lastSentY = y;
      this.socket.emit("playerMove", { x, y });
    }
  }
}
