import Phaser from "phaser";

export default class LoadScreen extends Phaser.Scene {
  constructor() {
    super("loadscreen");
  }

  preload() {
    this.load.image("titleScreen", "assets/titleScreen.png");

    this.load.image("startButton", "assets/startGameButton.png");

    this.load.image("gameTitle", "assets/shadowsofeterniatext.png");

    this.load.audio("titleMusic", "music/titleMusic.wav");

    let laodingbar = this.add.graphics({
      fillStyle: {
        color: 0xffffff, //white
      },
    });

    //simulate large load
    for (let i = 0; i < 69; i++) {
      this.load.image("titleScreen" + i, "assets/titleScreen.png");
    }

    //Loader Events:
    // complete - when done loading everything
    // progress - loader number progress in decimal
    this.load.on("progress", (percent: number) => {
      laodingbar.fillRect(
        0,
        this.game.renderer.height / 2,
        this.game.renderer.width * percent,
        50
      );
      console.log(percent);
    });

    this.load.on("complete", () => {
      console.log("done");
      this.scene.start("titlescreen");
    });
  }
}
