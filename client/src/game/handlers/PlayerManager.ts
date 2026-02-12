import { LocalPlayer } from "../entities/LocalPlayer";
import { RemotePlayer } from "../entities/RemotePlayer";

export class PlayerManager {
  private scene: Phaser.Scene;
  public localPlayer!: LocalPlayer;
  public remotePlayers: Map<string, RemotePlayer> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnLocal(x: number, y: number, name: string, color: string) {
    if (this.localPlayer) return;
    this.localPlayer = new LocalPlayer(this.scene, x, y, name, color);
  }

  spawnRemote(id: string, x: number, y: number, name: string, color: string) {
    if (this.remotePlayers.has(id)) return;
    const player = new RemotePlayer(this.scene, x, y, name, color);
    this.remotePlayers.set(id, player);
  }

  getPlayer(id: string, localId: string) {
    return id === localId ? this.localPlayer : this.remotePlayers.get(id);
  }

  removePlayer(id: string) {
    const p = this.remotePlayers.get(id);
    if (p) {
      p.destroy();
      this.remotePlayers.delete(id);
    }
  }
}
