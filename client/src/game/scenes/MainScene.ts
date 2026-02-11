import Phaser from "phaser";
import { Socket } from "socket.io-client";

export class MainScene extends Phaser.Scene {
  private socket: Socket;

  private playerBody!: Phaser.Physics.Arcade.Body;
  private playerRect!: Phaser.GameObjects.Rectangle;
  private otherPlayers: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;

  private lastSentX = 0;
  private lastSentY = 0;

  constructor(socket: Socket) {
    super("MainScene");
    this.socket = socket;
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as any;

    this.playerRect = this.add.rectangle(0, 0, 32, 32, 0x00ff00);
    this.physics.add.existing(this.playerRect);
    this.playerBody = this.playerRect.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);

    // --- SOCKET EVENTS ---

    this.socket.on("currentPlayers", (players: any) => {
      if (!this.sys.isActive()) return;

      Object.keys(players).forEach((id) => {
        if (id === this.socket.id) {
          this.playerRect.setPosition(players[id].x, players[id].y);
        } else {
          this.addOtherPlayer(id, players[id].x, players[id].y);
        }
      });
    });

    this.socket.on("newPlayer", (data: any) => {
      if (!this.sys.isActive()) return;
      this.addOtherPlayer(data.id, data.x, data.y);
    });

    this.socket.on("playerMoved", (data: any) => {
      const other = this.otherPlayers.get(data.id);
      if (other) other.setPosition(data.x, data.y);
    });

    this.socket.on("playerDisconnected", (id: string) => {
      const other = this.otherPlayers.get(id);
      if (other) {
        other.destroy();
        this.otherPlayers.delete(id);
      }
    });
  }

  private addOtherPlayer(id: string, x: number, y: number) {
    if (!this.sys.isActive() || this.otherPlayers.has(id)) return;

    const other = this.add.rectangle(x, y, 32, 32, 0xff0000);
    this.otherPlayers.set(id, other);
  }

  update() {
    if (!this.playerBody) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    this.playerBody.setVelocity(vx * speed, vy * speed);

    const x = Math.round(this.playerRect.x);
    const y = Math.round(this.playerRect.y);

    if (x !== this.lastSentX || y !== this.lastSentY) {
      this.lastSentX = x;
      this.lastSentY = y;
      this.socket.emit("playerMove", { x, y });
    }
  }
}
