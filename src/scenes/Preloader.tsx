import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }
  preload() {
    // this.load.image("tiles", "/tiles/spr_grass_tileset.png");
    // this.load.tilemapTiledJSON("testMap", "/tiles/testMap-01.json");

    this.load.image("healthBar-full", "ui/healthBar-full.png");
    this.load.image("healthBar-left-cap", "ui/healthBar-left-cap.png");
    this.load.image("healthBar-middle", "ui/healthBar-middle.png");
    this.load.image("healthBar-right-cap", "ui/healthBar-right-cap.png");
    this.load.image("text-bubble", "ui/text-bubble.png");
    this.load.atlas("Potion", "ui/Potion.png", "ui/Potion.json");
    // this.load.image("tiles", "/tiles/Grasslands-Terrain.png")
    // this.load.tilemapTiledJSON("town-map", "/tiles/town-map.json")
    // this.load.image("houses", "/tiles/Grasslands-Props.png")
    this.load.image("terrain", "/tiles/Grasslands-Terrain.png");
    this.load.image("props", "/tiles/Grasslands-Props.png");
    this.load.image("water", "/tiles/Grasslands-Water.png");
    this.load.tilemapTiledJSON("townMapV2", "tiles/townMapV2.json");

    // forestMap PreLoader
    this.load.image("ruinsTerrain", "/tiles/Ruins-Terrain.png");
    this.load.image("ruinsProps", "/tiles/Ruins-Props.png");
    this.load.image("grassProps", "/tiles/Grasslands-Props.png");
    this.load.tilemapTiledJSON("forestMap", "tiles/forestMap.json");

    // Ruins map Preload
    this.load.image("structures", "/tiles/Ruins-Structures.png");
    this.load.image("temple", "/tiles/Ancient-Temple.png");
    this.load.image("redWater", "/tiles/Ruins-Blood.png");
    this.load.tilemapTiledJSON("ruinsMap", "tiles/ruinsMap.json");

    this.load.atlas("man", "character/man.png", "character/man.json");
    this.load.atlas("slime", "character/slime.png", "character/slime.json");
    this.load.atlas(
      "jacked-skeleton",
      "enemies/jacked-skeleton.png",
      "enemies/jacked-skeleton.json"
    );
    this.load.atlas(
      "boss",
      "enemies/boss.png",
      "enemies/boss.json"
    );
    this.load.image("arrow", "weapons/weapon-arrow.png");
    this.load.image("knife", "weapons/weapon_knife.png");
    this.load.image("fireball", "weapons/weapon-fireball.png");
    this.load.image("slash", "weapons/slash.png");
    // this.load.image("rogue", "")
    this.load.atlas("barb", "character/barb.png", "character/barb.json");
    this.load.atlas("archer", "character/archer.png", "character/archer.json");
    this.load.atlas("wizard", "character/wizard.png", "character/wizard.json");
    this.load.atlas("barb", "character/barb.png", "character/barb.json");
    this.load.atlas("death", "character/death.png", "character/death.json");
    this.load.atlas(
      "npcWizard",
      "character/npcWizard.png",
      "character/npcWizard.json"
    );
  }

  create() {
    this.scene.start("chooseCharacter");
  }
}
