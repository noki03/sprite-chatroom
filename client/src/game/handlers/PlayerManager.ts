import { LocalPlayer } from "../entities/LocalPlayer";
import { RemotePlayer } from "../entities/RemotePlayer";

export class PlayerManager {
  public localPlayer!: LocalPlayer;
  public remotePlayers: Map<string, RemotePlayer> = new Map();
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnLocal(x: number, y: number) {
    this.localPlayer = new LocalPlayer(this.scene, x, y);
    return this.localPlayer;
  }

  spawnRemote(id: string, x: number, y: number) {
    if (this.remotePlayers.has(id)) return;
    const remote = new RemotePlayer(this.scene, id, x, y);
    this.remotePlayers.set(id, remote);
  }

  removePlayer(id: string) {
    this.remotePlayers.get(id)?.destroy();
    this.remotePlayers.delete(id);
  }

  getPlayer(id: string, socketId: string) {
    if (id === socketId) return this.localPlayer.sprite;
    return this.remotePlayers.get(id);
  }
}
