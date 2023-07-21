import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    // UI assets
    this.load.image("healthBar-full", "ui/healthBar-full.png");
    this.load.image("healthBar-left-cap", "ui/healthBar-left-cap.png");
    this.load.image("healthBar-middle", "ui/healthBar-middle.png");
    this.load.image("healthBar-right-cap", "ui/healthBar-right-cap.png");
    this.load.image("text-bubble", "ui/text-bubble.png");
    this.load.atlas("Potion", "ui/Potion.png", "ui/Potion.json");
    this.load.atlas("Resurrect", "ui/Resurrect.png", "ui/Resurrect.json");

    // Terrain and Prop assets
    this.load.image("terrain", "/tiles/Grasslands-Terrain.png");
    this.load.image("props", "/tiles/Grasslands-Props.png");
    this.load.image("water", "/tiles/Grasslands-Water.png");

    // Map data
    this.load.tilemapTiledJSON("townMapV2", "tiles/townMapV2.json");
    this.load.tilemapTiledJSON("forestMap", "tiles/forestMap.json");
    this.load.tilemapTiledJSON("ruinsMap", "tiles/ruinsMap.json");
    this.load.tilemapTiledJSON("bossMap", "tiles/bossMap.json");

    // Forest Map assets
    this.load.image("ruinsTerrain", "/tiles/Ruins-Terrain.png");
    this.load.image("ruinsProps", "/tiles/Ruins-Props.png");
    this.load.image("grassProps", "/tiles/Grasslands-Props.png");

    // Ruins Map assets
    this.load.image("structures", "/tiles/Ruins-Structures.png");
    this.load.image("temple", "/tiles/Ancient-Temple.png");
    this.load.image("redWater", "/tiles/Ruins-Blood.png");

     // Boss map prelaod
     this.load.image("bossStructures", "/tiles/Ruins-Structures.png");
     this.load.image("bossRuinsTerrain", "/tiles/Ruins-Terrain.png");
     this.load.image("bossRuinsProps", "/tiles/Ruins-Props.png");

    // Character assets
    this.load.atlas("man", "character/man.png", "character/man.json");
    this.load.atlas("slime", "character/slime.png", "character/slime.json");
    this.load.atlas(
      "jacked-skeleton",
      "enemies/jacked-skeleton.png",
      "enemies/jacked-skeleton.json"
    );
    this.load.atlas("boss", "enemies/boss.png", "enemies/boss.json");
    this.load.atlas("goblin", "enemies/goblin.png", "enemies/goblin.json");
    this.load.atlas(
      "baby-skeleton",
      "enemies/baby-skeleton.png",
      "enemies/baby-skeleton.json"
    );
    this.load.atlas("Dog", "character/Dog.png", "character/Dog.json");
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

    // Weapon assets
    this.load.image("arrow", "weapons/weapon-arrow.png");
    this.load.image("knife", "weapons/weapon_knife.png");
    this.load.image("fireball", "weapons/weapon-fireball.png");
    this.load.image("slash", "weapons/slash.png");

    // Audio assets
    this.load.audio("enemyCollide", "music/playerDmg2.mp3");
    this.load.audio("lobbyMusic", "music/loopMusic.mp3");
    this.load.audio("resurrect", "music/resurrectSound.mp3");
    this.load.audio("potion", "music/potion.mp3");
    this.load.audio("goblinDeath", "/music/goblinDeathSound.mp3");
    this.load.audio("skeleDeath", "/music/skeleDeath.mp3");
    this.load.audio("bossDeath", "/music/bossDeathSound2.mp3");
    this.load.audio("slimeDeath2", "/music/slimeDeathSound2.mp3");
  }

  create() {
    this.scene.start("loadscreen");
  }
}
