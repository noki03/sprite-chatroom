import Phaser from "phaser";

export class RemotePlayer extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    const sprite = scene.add.sprite(0, 0, "other-tex");
    const label = scene.add
      .text(0, 0, `User ${id.substring(0, 4)}`, {
        fontSize: "12px",
        backgroundColor: "#00000066",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1.5);

    super(scene, x, y, [sprite, label]);
    scene.add.existing(this);
    this.setDepth(y);
  }
}
