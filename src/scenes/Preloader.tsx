import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }
  preload() {
    this.load.image("tiles", "/tiles/spr_grass_tileset.png");
    this.load.tilemapTiledJSON("testMap", "/tiles/testMap-01.json");

    // this.load.image("tiles", "/tiles/spr_grass_tileset.png")
    // this.load.tilemapTiledJSON("caveMap", "/tiles/cave-test.json")

    this.load.atlas("man", "character/man.png", "character/man.json");
  }

  create() {
    this.scene.start("game");
  }
}
