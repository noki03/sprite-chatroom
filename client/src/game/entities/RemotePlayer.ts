import Phaser from "phaser";

export class RemotePlayer extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    color: string,
  ) {
    const sprite = scene.add.sprite(0, 0, "other-tex");
    const label = scene.add
      .text(0, 0, name, {
        fontSize: "12px",
        backgroundColor: "#00000066",
        color: color, // Apply the remote player's chosen color
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 2);

    super(scene, x, y, [sprite, label]);
    scene.add.existing(this);
    this.setDepth(y);
  }
}
