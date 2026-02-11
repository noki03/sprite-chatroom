import Phaser from "phaser";

export class ChatBubbleManager {
  private bubbles: Map<string, Phaser.GameObjects.Text> = new Map();
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // We typed target to ensure it has x and y
  showBubble(id: string, target: { x: number; y: number }, text: string) {
    this.bubbles.get(id)?.destroy();

    const bubble = this.scene.add
      .text(target.x, target.y - 50, text, {
        fontFamily: "Arial, sans-serif", // Use a cleaner font
        fontSize: "28px", // Double the size
        color: "#000",
        backgroundColor: "#fff",
        padding: { x: 12, y: 8 },
        wordWrap: { width: 300 }, // Adjust wrap for larger font
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setScale(0.5) // Scale it back down to 14px size for ultra-sharpness
      .setDepth(4000);

    this.bubbles.set(id, bubble);

    this.scene.tweens.add({
      targets: bubble,
      alpha: 0,
      delay: 3500,
      duration: 500,
      onComplete: () => {
        bubble.destroy();
        // Check if this is still the active bubble before deleting
        if (this.bubbles.get(id) === bubble) {
          this.bubbles.delete(id);
        }
      },
    });
  }

  update(getPlayerById: (id: string) => any) {
    this.bubbles.forEach((bubble, id) => {
      const player = getPlayerById(id);
      if (player) {
        bubble.setPosition(player.x, player.y - 50);
      }
    });
  }

  removeBubble(id: string) {
    const bubble = this.bubbles.get(id);
    if (bubble) {
      bubble.destroy();
      this.bubbles.delete(id);
    }
  }
}
