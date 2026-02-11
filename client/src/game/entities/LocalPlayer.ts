import Phaser from "phaser";

export class LocalPlayer {
  public sprite: Phaser.GameObjects.Sprite;
  public nameTag: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;
  private body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.add.sprite(x, y, "player-tex");
    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);

    this.nameTag = scene.add
      .text(x, y, "You", {
        fontFamily: "Arial", // Adding a cleaner font
        fontSize: "12px",
        backgroundColor: "#00000066",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 2.2);
  }

  update(cursors: any, wasd: any) {
    const isTyping = document.activeElement?.tagName === "INPUT";
    this.scene.input.keyboard!.enabled = !isTyping;

    if (isTyping) {
      this.body.setVelocity(0, 0);
      // Even when typing, keep them synced
      this.syncUI();
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

    this.body.setVelocity(vx * speed, vy * speed);

    // ⭐ THE FIX: Call a helper to keep things locked together
    this.syncUI();
  }

  private syncUI() {
    const roundedX = Math.round(this.sprite.x);
    const roundedY = Math.round(this.sprite.y);

    this.nameTag.setPosition(roundedX, roundedY);

    // Update depths for the Y-sorting effect
    this.sprite.setDepth(roundedY);
    this.nameTag.setDepth(roundedY + 1);
  }
}
