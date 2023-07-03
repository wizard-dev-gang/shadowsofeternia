import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }
  preload() {
    this.load.image("tiles", "/tiles/spr_grass_tileset.png");
    this.load.tilemapTiledJSON("testMap", "/tiles/testMap-01.json");

    this.load.atlas("man", "character/man.png", "character/man.json");
    this.load.atlas("slime", "character/slime.png", "character/slime.json");
  }

  create() {
    this.scene.start("game");
  }
}
