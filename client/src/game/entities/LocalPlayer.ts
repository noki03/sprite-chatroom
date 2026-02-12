import Phaser from "phaser";

export class LocalPlayer extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    name: string,
    color: string,
  ) {
    const sprite = scene.add.sprite(0, 0, "player-tex");
    const label = scene.add
      .text(0, 0, name, {
        fontSize: "12px",
        backgroundColor: "#00000066",
        color: color, // Apply chosen color
        fontStyle: "bold",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 2);

    super(scene, x, y, [sprite, label]);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
  }

  update(cursors: any, wasd: any) {
    const isTyping = document.activeElement instanceof HTMLInputElement;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (isTyping) {
      body.setVelocity(0, 0);
      return;
    }

    const speed = 200;
    let vx = 0,
      vy = 0;

    if (cursors.left.isDown || wasd.A.isDown) vx -= 1;
    if (cursors.right.isDown || wasd.D.isDown) vx += 1;
    if (cursors.up.isDown || wasd.W.isDown) vy -= 1;
    if (cursors.down.isDown || wasd.S.isDown) vy += 1;

    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }

    body.setVelocity(vx * speed, vy * speed);
    this.setDepth(this.y);
  }
}
