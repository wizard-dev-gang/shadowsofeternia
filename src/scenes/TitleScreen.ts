import Phaser from "phaser";

export default class TitleScreen extends Phaser.Scene {
  constructor() {
    super("titlescreen");
  }

  init(data: any) {
    console.log(data);
  }

  create() {
    this.add
      .image(
        this.game.renderer.width / 2,
        this.game.renderer.height * 0.2,
        "gameTitle"
      )
      .setOrigin(0.5, 0.5)
      .setScale(0.25)
      .setDepth(1);

    this.sound.play("titleMusic", { loop: true });

    this.add.image(0, 0, "titleScreen").setOrigin(0).setScale(0.35).setDepth(0);

    const startButton = this.add
      .image(
        this.game.renderer.width / 2,
        this.game.renderer.height * 0.7,
        "startButton"
      )
      .setOrigin(0.5, 0.5)
      .setDepth(2)
      .setInteractive();

    const originalScale = startButton.scaleX; // Store the original scale

    startButton
      .on("pointerover", () => {
        // Scale the image larger when the pointer is over
        startButton.setScale(originalScale * 1.2);
      })
      .on("pointerout", () => {
        // Revert to the original scale when the pointer is out
        startButton.setScale(originalScale);
      })
      .on("pointerdown", () => {
        this.sound.stopAll();
        this.scene.start("chooseCharacter");
      });
  }
}
