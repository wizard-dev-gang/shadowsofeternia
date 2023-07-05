import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }
  preload() {
    this.load.image("tiles", "/tiles/spr_grass_tileset.png");
    this.load.tilemapTiledJSON("testMap", "/tiles/testMap-01.json");

    this.load.image("healthBar-full", "ui/healthBar-full.png")
    this.load.image("healthBar-left-cap", "ui/healthBar-left-cap.png")
    this.load.image("healthBar-middle", "ui/healthBar-middle.png")
    this.load.image("healthBar-right-cap", "ui/healthBar-right-cap.png")

    // this.load.image("tiles", "/tiles/spr_grass_tileset.png")
    // this.load.tilemapTiledJSON("caveMap", "/tiles/cave-test.json")

    this.load.atlas("man", "character/man.png", "character/man.json");
  }

  create() {
    this.scene.start("game");
  }
}
