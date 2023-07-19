import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import { Goblin } from "../enemies/Goblin";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { update } from "firebase/database";
import { sceneEvents } from "../events/EventsCenter";
import { Barb } from "../characters/Barb";
import { Archer } from "../characters/Archer";
import "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import "../characters/Npc";
import { CollisionHandler } from "./Collisions";
import { Potion } from "../characters/Potion";
import { createPotionAnims } from "../anims/PotionAnims";
import { Resurrect } from "../characters/Resurrect";
import "../characters/Resurrect";
import { createResurrectAnims } from "../anims/ResurrectAnims";

export default class Ruins extends Phaser.Scene {
  // private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Player;
  private barb?: Barb; //Barbarian Character
  private archer?: Archer; //Archer Character
  private wizard?: Wizard; //Wizard Character
  public projectiles!: Phaser.Physics.Arcade.Group;
  public skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  private slimes!: Phaser.Physics.Arcade.Group; //  Group to manage slime enemies
  private goblins!: Phaser.Physics.Arcade.Group; //  Group to manage goblin enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  // private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  public collisionHandler: CollisionHandler;
  private resurrect!: Resurrect;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  public potion!: Potion;
  private collideSound: Phaser.Sound.BaseSound;
  private resurrectSound: Phaser.Sound.BaseSound;
  private potionSound: Phaser.Sound.BaseSound;
  private backgroundMusic: Phaser.Sound.BaseSound;
  private slimeDeathSound: Phaser.Sound.BaseSound;
  private npcHm: Phaser.Sound.BaseSound;
  private projectileHit: Phaser.Sound.BaseSound;
  public map?: Phaser.Tilemaps.Tilemap;
  public miniMapBackground?: Phaser.GameObjects.Rectangle;
  public miniMapBoss?: Phaser.GameObjects.Arc;
  public miniMapLocation?: Phaser.GameObjects.Arc;
  private boss?: Phaser.Physics.Arcade.Group;
  private babySkeletons?: Phaser.Physics.Arcade.Group;
  private dog?: Phaser.Physics.Arcade.Group;
  private dogBark: Phaser.Sound.BaseSound;
  public exp: number;

  // Firebase variables
  public characterName?: string;
  public characterLevel?: number;
  public playerRef!: any; // Reference to the current player in Firebase
  public playerId!: any; // ID of the current player
  public otherPlayers!: Map<any, any>; // Map to store other players in the game
  public playerNames!: Map<any, any>; // Map to store player names
  public playerName?: Phaser.GameObjects.Text; // Text object to display the current player's name
  public enemies!: Map<any, any>; // Map to store enemies in the game
  public enemyDB!: any;
  public dataToSend: any = {};
  public updateIterations = 0;
  private enemyCount: number = 0;
  public playerLevel?: Phaser.GameObjects.Text;

  constructor() {
    super("ruins");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
    this.enemies = new Map();
    this.collisionHandler = new CollisionHandler();
  }

  preload() {
    // this.cursors = this.input.keyboard?.createCursorKeys();
    this.load.audio("enemyCollide", "music/playerDmg2.mp3");
    this.load.audio("resurrect", "music/resurrectSound.mp3");
    this.load.audio("potion", "music/potion.mp3");
    this.load.audio("playerDeadSound", "/music/playerIsDead.mp3");
    this.load.audio("ruinsScene", "/music/ruinsScene.wav");
    this.load.audio("slimeDeath", "/music/slimeDeathSound.mp3");
    this.load.audio("npcHm", "/music/npcHm.mp3");
    this.load.audio("projectileHit", "/music/projectileHit.mp3");
    this.load.audio("bossMusic", "/music/bossScene.mp3");
  }

  init(data: any) {
    this.characterName = data.characterName;
    this.characterLevel = data.level;
  }

  create() {
    const collisionHandler = new CollisionHandler(
      this.projectiles,
      this.skeletons,
      this.boss,
      this.slimes,
      this.babySkeletons,
      this.time,
      this.Npc_wizard,
      this.add,
      this.potion,
      this.playerId,
      this.dog,
      this.goblins,
      this.resurrect,
      this.collideSound,
      this.resurrectSound,
      this.potionSound,
      this.dogBark,
      this.npcHm,
      this.slimeDeathSound,
      this.projectileHit
    );

    this.scene.run("player-ui");
    this.collideSound = this.sound.add("enemyCollide");
    this.resurrectSound = this.sound.add("resurrect");
    this.potionSound = this.sound.add("potion");
    this.slimeDeathSound = this.sound.add("slimeDeath");
    this.npcHm = this.sound.add("npcHm");
    this.projectileHit = this.sound.add("projectileHit");

    this.backgroundMusic = this.sound.add("ruinsScene", {
      volume: 0.5,
      loop: true,
    });

    // Play the audio
    this.backgroundMusic.play();

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(Ruins);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createPotionAnims(this.anims);
    createResurrectAnims(this.anims);

    const map = this.make.tilemap({ key: "ruinsMap" });
    this.map = map;
    const structureTiles = map.addTilesetImage(
      "Ruins-Structures",
      "structures"
    );
    const waterTiles = map.addTilesetImage("Ruins-Blood", "redWater");
    const terrainTiles = map.addTilesetImage("Ruins-Terrain", "ruinsTerrain");
    const templeTiles = map.addTilesetImage("Ancient-Temple", "temple");
    const propTiles = map.addTilesetImage("Ruins-Props", "ruinsProps");

    if (
      structureTiles &&
      templeTiles &&
      waterTiles &&
      terrainTiles &&
      propTiles
    ) {
      const groundLayer = map.createLayer("Ground", terrainTiles, 0, 0);
      const waterLayer = map.createLayer("Water", waterTiles, 0, 0);
      const pathLayer = map.createLayer("Paths", structureTiles, 0, 0);
      const grassLayer = map.createLayer("Grass", propTiles, 0, 0);
      const platformLayer = map.createLayer(
        "Platform-Ground",
        terrainTiles,
        0,
        0
      );
      const propsLayer = map.createLayer("Props", propTiles);
      const templeLayer = map.createLayer("Temple", templeTiles, 0, 0);
      const borderLayer = map.createLayer("Border", structureTiles, 0, 0);

      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      pathLayer?.setCollisionByProperty({ collides: true });
      platformLayer?.setCollisionByProperty({ collides: true });
      templeLayer?.setCollisionByProperty({ collides: true });
      grassLayer?.setCollisionByProperty({ collides: true });
      propsLayer?.setCollisionByProperty({ collides: true });
      borderLayer?.setCollisionByProperty({ collides: true });

      if (this.characterName === "barb") {
        this.barb = this.add.barb(2500, 3100, "barb");
        this.barb.level = this.characterLevel;
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(2500, 3100, "archer");
        this.cameras.main.startFollow(this.archer);
        this.archer.level = this.characterLevel;
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(2500, 3100, "wizard");
        this.cameras.main.startFollow(this.wizard);
        this.wizard.level = this.characterLevel;
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(2500, 3100, "man");
        this.man.level = this.characterLevel;
        this.cameras.main.startFollow(this.man);
      }

      const playerCharacters = [this.barb, this.wizard, this.archer, this.man];

      this.skeletons = this.physics.add.group({
        classType: Skeleton,
        createCallback: (go) => {
          const skeleGo = go as Skeleton;
          this.enemyCount++;
          if (skeleGo.body) {
            skeleGo.body.onCollide = true;

            // Adjust the hitbox size here
            const hitboxWidth = 20; // Set the desired hitbox width
            const hitboxHeight = 20; // Set the desired hitbox height
            skeleGo.body.setSize(hitboxWidth, hitboxHeight);

            // Set the hitbox offset here
            const offsetX = 6; // Set the desired X offset
            const offsetY = 14; // Set the desired Y offset
            skeleGo.body.setOffset(offsetX, offsetY);
          }
          this.enemies.set(this.enemyCount, skeleGo);
        },
      });

      // Set up goblins and handle collisions
      this.goblins = this.physics.add.group({
        classType: Goblin,
        createCallback: (go) => {
          const goblinGo = go as Goblin;
          this.enemyCount++;
          if (goblinGo.body) {
            goblinGo.body.onCollide = true;

            // Adjust the hitbox size here
            const hitboxWidth = 20;
            const hitboxHeight = 20;
            goblinGo.body.setSize(hitboxWidth, hitboxHeight);

            // Set the hitbox offset here
            const offsetX = 6;
            const offsetY = 14;
            goblinGo.body.setOffset(offsetX, offsetY);
          }
          this.enemies.set(this.enemyCount, goblinGo);
        },
      });

      // Create a group for knives with a maximum size of 3
      this.projectiles = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize: 100,
      });

      // Set knives for each player
      playerCharacters.forEach((character) => {
        if (character) {
          character.setProjectiles(this.projectiles);
        }
      });

      if (playerCharacters && this.skeletons) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.skeletons,
          this.collisionHandler.handlePlayerEnemyCollision as any,
          undefined,
          this
        );
      }
      console.log("creating enemy colliders...");

      if (playerCharacters && this.goblins) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.goblins,
          this.collisionHandler.handlePlayerGoblinCollision as any,
          undefined,
          this
        );
      }

      // Handle collisions between player and enemy characters
      if (playerCharacters && this.playerEnemiesCollider) {
        console.log("create playerenemiescollider");
        this.playerEnemiesCollider = this.physics.add.collider(
          this.skeletons,
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.collisionHandler.handlePlayerEnemyCollision as any,
          undefined,
          this
        );
      }

      // Handle collisions between player and goblin characters
      if (playerCharacters && this.goblins) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.goblins,
          this.collisionHandler.handlePlayerGoblinCollision as any,
          undefined,
          this
        );
      }

      if (playerCharacters && this.goblins) {
        // Handle collisions between goblins and layers
        if (groundLayer) this.physics.add.collider(this.goblins, groundLayer);
        if (waterLayer) this.physics.add.collider(this.goblins, waterLayer);
        if (pathLayer) this.physics.add.collider(this.goblins, pathLayer);
        if (platformLayer)
          this.physics.add.collider(this.goblins, platformLayer);
        if (templeLayer) this.physics.add.collider(this.goblins, templeLayer);
        if (borderLayer) this.physics.add.collider(this.goblins, borderLayer);
        if (propsLayer) this.physics.add.collider(this.goblins, propsLayer);
      }

      // Handle collisions between skeletons and ground layers
      if (this.skeletons && groundLayer) {
        this.physics.add.collider(this.skeletons, groundLayer);
        this.physics.add.collider(
          this.projectiles,
          groundLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      if (this.skeletons && waterLayer) {
        this.physics.add.collider(this.skeletons, waterLayer);
        this.physics.add.collider(
          this.projectiles,
          waterLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      // Handle collisions between skeletons and house layers
      if (this.skeletons && pathLayer) {
        this.physics.add.collider(this.skeletons, pathLayer);
        this.physics.add.collider(
          this.projectiles,
          pathLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }
      // Handle collisions between skeletons and fences
      if (this.skeletons && platformLayer) {
        this.physics.add.collider(this.skeletons, platformLayer);
        this.physics.add.collider(
          this.projectiles,
          platformLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      // Handle collisions between skeletons and trees
      if (this.skeletons && templeLayer) {
        this.physics.add.collider(this.skeletons, templeLayer);
        this.physics.add.collider(
          this.projectiles,
          templeLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      if (this.skeletons && borderLayer) {
        this.physics.add.collider(this.skeletons, borderLayer);
        this.physics.add.collider(
          this.projectiles,
          borderLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      if (this.skeletons && propsLayer) {
        this.physics.add.collider(this.skeletons, propsLayer);
        this.physics.add.collider(
          this.projectiles,
          propsLayer,
          collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      if (playerCharacters) {
        //if statements are to satisfy TypeScipt compiler
        if (groundLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            groundLayer
          );
        if (waterLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            waterLayer
          );
        if (pathLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            pathLayer
          );
        if (grassLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            grassLayer
          );
        if (propsLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            propsLayer
          );
        if (platformLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            platformLayer
          );
        if (templeLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            templeLayer
          );
        if (borderLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            borderLayer
          );

        // Add text for player name
        this.playerName = this.add
          .text(0, 0, "You", {
            fontSize: "10px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2,
          })
          .setOrigin(0.5, 1);
        // Add text for player level
        this.playerLevel = this.add
          .text(0, 0, "Level: " + this.characterLevel, {
            fontSize: "12px",
            color: "#FFD700",
            stroke: "#000000",
            strokeThickness: 1,
          })
          .setOrigin(0.5, 1);
      }
      this.potion = this.physics.add.group({
        classType: Potion,
        createCallback: (go) => {
          const PotionGo = go as Potion;
          if (PotionGo.body) {
            PotionGo.body.onCollide = true;
          }
        },
      });

      this.resurrect = this.physics.add.group({
        classType: Resurrect,
        createCallback: (go) => {
          const ResGo = go as Resurrect;
          if (ResGo.body) {
            ResGo.body.onCollide = true;
          }
        },
      });

      this.resurrect.get(1580, 2450, "Resurrect");
      this.resurrect.get(1390, 2310, "Resurrect");
      this.resurrect.get(958, 1320, "Resurrect");
      this.resurrect.get(1755, 750, "Resurrect");
    }

    this.miniMapBackground = this.add.rectangle(
      2000,
      1100,
      72,
      72,
      Phaser.Display.Color.GetColor(12, 70, 9)
    );
    this.miniMapBackground.setAlpha(0.6);
    this.miniMapBackground.setVisible(false);

    this.miniMapLocation = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(255, 0, 0)
    );
    this.miniMapLocation.setVisible(false);

    this.miniMapBoss = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(0, 255, 0)
    );
    this.miniMapBoss.setVisible(false);

    const q = this.input.keyboard?.addKey("Q");
    q?.on("down", () => {
      if (this.miniMapBackground && this.miniMapLocation && this.miniMapBoss) {
        this.miniMapBackground.setVisible(true);
        this.miniMapLocation.setVisible(true);
        this.miniMapBoss.setVisible(true);
      }
    });

    q?.on("up", () => {
      if (this.miniMapBackground && this.miniMapLocation && this.miniMapBoss) {
        this.miniMapBackground.setVisible(false);
        this.miniMapLocation.setVisible(false);
        this.miniMapBoss.setVisible(false);
      }
    });
  }

  private levelUpPlayer(player: Player) {
    const expNeeded = Math.round(10 * Math.pow(1.5, player.level - 1)); //Set the amout of exp need to level up to increase 1.25 times everytime the player levels up
    if (player.exp >= expNeeded) {
      player.exp -= expNeeded;
      player._health *= 1.25; //increase the players current health by 1.25 times
      player._health = Math.round(player._health); // Round the players health to the nearest whole number
      player.maxHealth *= 1.25; //increase the players max health by 1.25 times
      player.maxHealth = Math.round(player.maxHealth); // Round the players max health to the nearest whole number
      player.level++; // level the player up
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);

      // Update the player's max health in the health bar
      if (this.scene.isActive("player-ui")) {
        this.scene
          .get("player-ui")
          .events.emit("player-max-health-changed", player.maxHealth);
      }

      this.updatePlayerMaxHealth(player.maxHealth);

      // if (this.playerRef) {
      //   update(this.playerRef, {
      //     exp: player.exp,
      //     hp: player._health,
      //     maxHealth: player.maxHealth,
      //     level: player.level,
      //   });
      // }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpBarb(player: Barb) {
    const expNeeded = Math.round(10 * Math.pow(1.5, player.level - 1)); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
    if (player.exp >= expNeeded) {
      player.exp -= expNeeded;
      player._health *= 1.25; //increase the players current health by 1.25 times
      player._health = Math.round(player._health); // Round the players health to the nearest whole number
      player.maxHealth *= 1.25; //increase the players max health by 1.25 times
      player.maxHealth = Math.round(player.maxHealth); // Round the players max health to the nearest whole number
      player.level++; // level the player up
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);

      // Update the player's max health in the health bar
      if (this.scene.isActive("player-ui")) {
        this.scene
          .get("player-ui")
          .events.emit("player-max-health-changed", player.maxHealth);
      }

      this.updatePlayerMaxHealth(player.maxHealth);

      // if (this.playerRef) {
      //   update(this.playerRef, {
      //     exp: player.exp,
      //     hp: player._health,
      //     maxHealth: player.maxHealth,
      //     level: player.level,
      //   });
      // }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpArcher(player: Archer) {
    const expNeeded = Math.round(10 * Math.pow(1.5, player.level - 1)); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
    if (player.exp >= expNeeded) {
      player.exp -= expNeeded;
      player._health *= 1.25; //increase the players current health by 1.25 times
      player._health = Math.round(player._health); // Round the players health to the nearest whole number
      player.maxHealth *= 1.25; //increase the players max health by 1.25 times
      player.maxHealth = Math.round(player.maxHealth); // Round the players max health to the nearest whole number
      player.level++; // level the player up
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);

      // Update the player's max health in the health bar
      if (this.scene.isActive("player-ui")) {
        this.scene
          .get("player-ui")
          .events.emit("player-max-health-changed", player.maxHealth);
      }

      this.updatePlayerMaxHealth(player.maxHealth);

      // if (this.playerRef) {
      //   update(this.playerRef, {
      //     exp: player.exp,
      //     hp: player._health,
      //     maxHealth: player.maxHealth,
      //     level: player.level,
      //   });
      // }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpWizard(player: Wizard) {
    const expNeeded = Math.round(10 * Math.pow(1.5, player.level - 1)); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
    if (player.exp >= expNeeded) {
      player.exp -= expNeeded;
      player._health *= 1.25; //increase the players current health by 1.25 times
      player._health = Math.round(player._health); // Round the players health to the nearest whole number
      player.maxHealth *= 1.25; //increase the players max health by 1.25 times
      player.maxHealth = Math.round(player.maxHealth); // Round the players max health to the nearest whole number
      player.level++; // level the player up
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);

      // Update the player's max health in the health bar
      if (this.scene.isActive("player-ui")) {
        this.scene
          .get("player-ui")
          .events.emit("player-max-health-changed", player.maxHealth);
      }

      this.updatePlayerMaxHealth(player.maxHealth);

      // if (this.playerRef) {
      //   update(this.playerRef, {
      //     exp: player.exp,
      //     hp: player._health,
      //     maxHealth: player.maxHealth,
      //     level: player.level,
      //   });
      // }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private updatePlayerMaxHealth(maxHealth: number) {
    // Update the player's max health value in the database
    if (this.playerRef) {
      update(this.playerRef, {
        maxHealth: maxHealth,
      });
    }
  }

  update() {
    this.updateIterations++;
    let character;

    if (this.man) {
      this.man.update();
      character = this.man;
      this.levelUpPlayer(this.man);
    } else if (this.barb) {
      this.barb.update();
      character = this.barb;
      this.levelUpBarb(this.barb);
    } else if (this.archer) {
      this.archer.update();
      character = this.archer;
      this.levelUpArcher(this.archer);
    } else if (this.wizard) {
      this.wizard.update();
      character = this.wizard;
      this.levelUpWizard(this.wizard);
    }
    if (!character) return;
    const bossX = character.x >= 1734 && character.x <= 1765;
    const bossY = character.y <= 440 && character.y >= 412;
    if (bossX && bossY) {
      this.scene.start("bossMap", {
        characterName: this.characterName,
        level: character.level,
      });
      update(this.playerRef, {
        x: character.x,
        y: character.y,
        anim: character.anims.currentAnim
          ? character.anims.currentAnim.key
          : null,
        frame: character.anims.currentFrame
          ? character.anims.currentFrame.frame.name
          : null,
        online: true,
        projectilesFromDB: character.projectilesToSend,
        scene: "bossMap",
        level: character.level,
      });
      this.sound.stopAll();
      return;
    }

    // if (this.characterName === "rogue") {
    if (
      character.y <= 3150 &&
      character.y >= 3100 &&
      character.x <= 2614 &&
      character.x >= 2250 &&
      this.goblins.countActive() === 0
    ) {
      this.goblins.get(2540, 2940, "goblin");
      this.goblins.get(2440, 2940, "goblin");
      this.goblins.get(2500, 2940, "goblin");
      this.goblins.get(2520, 2940, "goblin");
    } else if (
      character.y <= 2870 &&
      character.y >= 2810 &&
      character.x <= 2554 &&
      character.x >= 2438 &&
      this.skeletons.countActive() === 0
    ) {
      this.skeletons.get(2000, 2300, "skeleton");
      this.skeletons.get(2050, 2600, "skeleton");
      this.skeletons.get(2100, 2500, "skeleton");
      this.skeletons.get(2200, 2400, "skeleton");
      this.skeletons.get(2250, 2400, "skeleton");
      this.skeletons.get(2300, 2450, "skeleton");
      this.skeletons.get(2350, 2400, "skeleton");
      this.skeletons.get(2400, 2640, "skeleton");
    } else if (
      character.y <= 2448 &&
      character.y >= 2395 &&
      character.x <= 1870 &&
      character.x >= 1720 &&
      this.skeletons.countActive() <= 8
    ) {
      this.skeletons.get(1490, 1900, "skeleton");
      this.skeletons.get(1500, 2000, "skeleton");
      this.skeletons.get(1600, 2100, "skeleton");
      this.skeletons.get(1650, 2220, "skeleton");
    } else if (
      character.y <= 1776 &&
      character.y >= 1660 &&
      character.x <= 1450 &&
      character.x >= 1360 &&
      this.skeletons.countActive() <= 12
    ) {
      this.skeletons.get(900, 1665, "skeleton");
      this.skeletons.get(1000, 1700, "skeleton");
      this.skeletons.get(950, 1760, "skeleton");
      this.skeletons.get(1100, 1720, "skeleton");
    } else if (
      character.y <= 1890 &&
      character.y >= 1815 &&
      character.x <= 858 &&
      character.x >= 741 &&
      this.goblins.countActive() <= 4
    ) {
      this.goblins.get(700, 1950, "goblin");
      this.goblins.get(750, 2000, "goblin");
      this.goblins.get(800, 2020, "goblin");
      this.goblins.get(900, 2080, "goblin");
      this.goblins.get(950, 2100, "goblin");
      this.goblins.get(1000, 2150, "goblin");
      this.goblins.get(1050, 2200, "goblin");
      this.goblins.get(1200, 2250, "goblin");
    } else if (
      character.y <= 2610 &&
      character.y >= 2500 &&
      character.x <= 1431 &&
      character.x >= 1354 &&
      this.skeletons.countActive() <= 16
    ) {
      this.skeletons.get(1220, 2720, "skeleton");
      this.skeletons.get(1250, 2800, "skeleton");
      this.skeletons.get(1300, 2850, "skeleton");
      this.skeletons.get(1350, 2880, "skeleton");
    } else if (
      character.y <= 2630 &&
      character.y >= 2550 &&
      character.x <= 311 &&
      character.x >= 106 &&
      this.goblins.countActive() <= 12
    ) {
      this.goblins.get(50, 1920, "goblin");
      this.goblins.get(100, 2000, "goblin");
      this.goblins.get(150, 2050, "goblin");
      this.goblins.get(200, 2100, "goblin");
      this.goblins.get(250, 2200, "goblin");
    } else if (
      character.y <= 1616 &&
      character.y >= 1250 &&
      character.x <= 1350 &&
      character.x >= 1250 &&
      this.skeletons.countActive() <= 20 &&
      this.goblins.countActive() <= 17
    ) {
      this.goblins.get(1500, 1260, "goblin");
      this.goblins.get(1550, 1300, "goblin");
      this.goblins.get(1600, 1350, "goblin");
      this.goblins.get(1650, 1400, "goblin");
      this.skeletons.get(1700, 1450, "skeleton");
      this.skeletons.get(1750, 1500, "skeleton");
      this.skeletons.get(1800, 1530, "skeleton");
      this.skeletons.get(1900, 1430, "skeleton");
    } else if (
      character.y <= 1250 &&
      character.y >= 1150 &&
      character.x <= 2060 &&
      character.x >= 1770 &&
      this.goblins.countActive() <= 21
    ) {
      this.goblins.get(1500, 830, "goblin");
      this.goblins.get(1550, 870, "goblin");
      this.goblins.get(1600, 900, "goblin");
      this.goblins.get(1650, 950, "goblin");
      this.goblins.get(1700, 1000, "goblin");
      this.goblins.get(1750, 1050, "goblin");
      this.goblins.get(1800, 1030, "goblin");
      this.goblins.get(1850, 910, "goblin");
      this.goblins.get(1900, 850, "goblin");
      this.goblins.get(2000, 1090, "goblin");
      //}
    }

    if (character && character.isDead) {
      this.physics.add.overlap(
        character,
        this.resurrect,
        this.collisionHandler.handlePlayerResurrectCollision as any,
        undefined,
        this
      );
      this.resurrect.setVisible(true);
    } else {
      this.resurrect.setVisible(false);
    }

    if (this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;

      // Position of the name above the player
      this.playerName.y = character.y - 20;

      if (this.playerLevel) {
        this.playerLevel.x = this.playerName.x;
        this.playerLevel.y = character.y - 10;
      }

      //Handle Collision Between Player and Potions
      this.physics.overlap(
        character,
        this.potion,
        this.collisionHandler.handlePlayerPotionCollision as any,
        undefined,
        this
      );
      // Handle collision between knives and skeletons
      this.physics.overlap(
        this.projectiles,
        this.skeletons,
        this.collisionHandler.handleProjectileSkeletonCollision as any,
        undefined,
        this
      );

      // Handle collision between projectiles and goblins
      this.physics.overlap(
        this.projectiles,
        this.goblins,
        this.collisionHandler.handleProjectileGoblinCollision as any,
        undefined,
        this
      );

      if (
        Phaser.Input.Keyboard.JustDown(
          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        )
      ) {
        this.physics.overlap(
          character,
          this.Npc_wizard,
          this.collisionHandler.handlePlayerNpcCollision as any,
          undefined,
          this
        );
      }
      if (this.playerRef) {
        update(this.playerRef, {
          x: character.x,
          y: character.y,
          anim: character.anims.currentAnim
            ? character.anims.currentAnim.key
            : null,
          frame: character.anims.currentFrame
            ? character.anims.currentFrame.frame.name
            : null,
          online: true,
          projectilesFromDB: character.projectilesToSend,
          scene: this.scene.key,
          level: character.level,
        });
        character.projectilesToSend = {};
      }
    }

    if (this.characterName === "rogue") {
      if (this.updateIterations % 3 === 0) {
        for (const entry of this.enemies.entries()) {
          if (entry[1].isAlive) {
            this.dataToSend[entry[0]] = {
              id: entry[0],
              x: entry[1].x,
              y: entry[1].y,
              anim: entry[1].anims.currentAnim
                ? entry[1].anims.currentAnim.key
                : null,
              frame: entry[1].anims.currentFrame
                ? entry[1].anims.currentFrame.frame.name
                : null,
              isAlive: entry[1].isAlive,
            };
          } else {
            this.dataToSend[entry[0]] = {
              id: entry[0],
              isAlive: entry[1].isAlive,
            };
          }
        }
        update(this.enemyDB, this.dataToSend);
      }
    }

    if (this.updateIterations % 3 === 0) {
      for (const entry of this.enemies.entries()) {
        if (entry[1].isAlive) {
          entry[1].findTarget(this.otherPlayers, {
            x: character.x,
            y: character.y,
            isDead: character.isDead,
          });
        }
      }
    }

    if (
      this.miniMapBackground &&
      this.miniMapLocation &&
      this.map &&
      this.miniMapBoss
    ) {
      const backgroundLocation = this.getMiniLocation(
        this.map.widthInPixels / 2,
        this.map.heightInPixels / 2,
        character
      );
      this.miniMapBackground.x = backgroundLocation.x;
      this.miniMapBackground.y = backgroundLocation.y;
      // this.miniMapBorder.setPosition(this.miniMapBackground.x, this.miniMapBackground.y);

      const playerLocation = this.getMiniLocation(
        character.x,
        character.y,
        character
      );
      this.miniMapLocation.x = playerLocation.x;
      this.miniMapLocation.y = playerLocation.y;
      const bossLocation = this.getMiniLocation(1746, 476, character);
      this.miniMapBoss.x = bossLocation.x;
      this.miniMapBoss.y = bossLocation.y;
    }
  }
  getMiniLocation(
    x: number,
    y: number,
    character: Player | Barb | Wizard | Archer
  ) {
    if (this.miniMapBackground && this.map) {
      const centerX = character.x + 120;
      const centerY = character.y + 90;
      // console.log(this.map.widthInPixels, this.map.heightInPixels);

      const ratioX = this.miniMapBackground.width / this.map.widthInPixels;
      const ratioY = this.miniMapBackground.height / this.map.heightInPixels;
      const distanceX = x - this.map.widthInPixels / 2;
      const distanceY = y - this.map.heightInPixels / 2;
      const scaledX = distanceX * ratioX;
      const scaledY = distanceY * ratioY;
      return { x: centerX + scaledX, y: centerY + scaledY };
    }
    return { x: 0, y: 0 };
  }
}
