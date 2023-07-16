import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Slime } from "../enemies/Slime";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { update } from "firebase/database";
import { sceneEvents } from "../events/EventsCenter";
import { Barb } from "../characters/Barb";
import { Archer } from "../characters/Archer";
import "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import { createNpcAnims } from "../anims/NpcAnims";
import { Npc_wizard } from "../characters/Npc";
import "../characters/Npc";
import { CollisionHandler } from "./Collisions";
import { Potion } from "../characters/Potion";
import { createPotionAnims } from "../anims/PotionAnims";
import { Resurrect } from "../characters/Resurrect";
import "../characters/Resurrect";
import { createResurrectAnims } from "../anims/ResurrectAnims";
import Dog from "../characters/Dog";
import { createDogAnims } from "../anims/DogAnims";
import { Goblin } from "../enemies/Goblins"

export default class Game extends Phaser.Scene {
  // Private variables:
  private archer?: Archer;
  private barb?: Barb;
  private collideSound: Phaser.Sound.BaseSound;
  private enemyCount: number = 0;

  private man?: Player;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider;
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  private resurrectSound: Phaser.Sound.BaseSound;
  private potionSound: Phaser.Sound.BaseSound;
  private skeletons!: Phaser.Physics.Arcade.Group;
  private slimes!: Phaser.Physics.Arcade.Group;
  private wizard?: Wizard;

  // Public variables:
  public collisionHandler: CollisionHandler;
  public exp: number = 0;
  public map?: Phaser.Tilemaps.Tilemap;
  public miniMapBackground?: Phaser.GameObjects.Rectangle;
  // public miniMapBorder?: Phaser.GameObjects.Rectangle;
  public miniMapForest?: Phaser.GameObjects.Arc;
  public miniMapLocation?: Phaser.GameObjects.Arc;
  public potion!: Potion;
  public projectiles!: Phaser.Physics.Arcade.Group;
  public resurrect!: Resurrect;
  public sceneFrom?: string;
  private dog!: Phaser.Physics.Arcade.Group;
  private goblin!: Phaser.Physics.Arcade.Group;
  private playerGoblinCollider?: Phaser.Physics.Arcade.Collider;
  private dogBark: Phaser.Sound.BaseSound;

  // Firebase variables
  public characterName?: string;
  public playerRef!: any; // Reference to the current player in Firebase
  public playerId!: any; // ID of the current player
  public otherPlayers!: Map<any, any>; // Map to store other players in the game
  public playerNames!: Map<any, any>; // Map to store player names
  public playerName?: Phaser.GameObjects.Text; // Text object to display the current player's name
  public playerLevels!: Map<any, any>; // Map to store player levels
  public playerLevel?: Phaser.GameObjects.Text; // Text object to display the current player's level
  public enemies!: Map<any, any>; // Map to store enemies in the game
  public enemyDB!: any;
  public dataToSend: any = {};
  public updateIterations = 0;

  constructor() {
    super("game");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
    this.enemies = new Map();
    this.collisionHandler = new CollisionHandler();
    // this.load.audio("enemyCollide", "audio/playerDmg2.mp3");
  }

  preload() {
    // const cursors = this.input.keyboard?.createCursorKeys();
    this.load.audio("enemyCollide", "music/playerDmg2.mp3");
    this.load.audio("resurrect", "music/resurrectSound.mp3");
    this.load.audio("potion", "music/potion.mp3");
    this.load.audio("playerDeadSound", "/music/playerIsDead.mp3");
    this.load.audio("dogBark", "/music/dogBark.mp3");
  }

  init(data?: { name: string; from?: string }) {
    // console.log("init data", data);
    // console.log(this.input);
    this.characterName = data?.name;
  }

  create() {
    this.collisionHandler = new CollisionHandler(
      this.projectiles,
      this.skeletons,
      this.slimes,
      this.time,
      this.Npc_wizard,
      this.add,
      this.potion,
      this.playerId,
      this.resurrect,
      this.collideSound,
      this.resurrectSound,
      this.potionSound,
      this.dog,
      this.dogBark
    );
    this.scene.run("player-ui");
    this.collideSound = this.sound.add("enemyCollide");
    this.resurrectSound = this.sound.add("resurrect");
    this.potionSound = this.sound.add("potion");
    this.dogBark = this.sound.add("dogBark");

    // this.miniMapScene = this.scene.add("mini-map", MiniMapScene, true);

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createNpcAnims(this.anims);
    createPotionAnims(this.anims);
    createResurrectAnims(this.anims);
    createDogAnims(this.anims);

    //Create tilemap and tileset
    const map = this.make.tilemap({ key: "townMapV2" });
    this.map = map;
    // console.log('map', map.width, map.height, map.widthInPixels, map.heightInPixels)
    const tileset = map.addTilesetImage("Grasslands-Terrain", "terrain");
    const propTiles = map.addTilesetImage("Grasslands-Props", "props");
    const waterTiles = map.addTilesetImage("Grasslands-Water", "water");

    // Create layers for the tilemap
    if (tileset && propTiles && waterTiles) {
      const waterLayer = map.createLayer("Water", waterTiles, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const treesLayer = map.createLayer("Trees", propTiles, 0, 0);
      const bushesLayer = map.createLayer("Bushes", propTiles, 0, 0);
      const fenceLayer = map.createLayer("Fences", propTiles, 0, 0);
      const pathLayer = map.createLayer("Paths", tileset, 0, 0);
      const houseLayer = map.createLayer("Houses", propTiles, 0, 0);

      // Set collision properties for the layers
      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      treesLayer?.setCollisionByProperty({ collides: true });
      bushesLayer?.setCollisionByProperty({ colldes: false });
      fenceLayer?.setCollisionByProperty({ collides: true });
      pathLayer?.setCollisionByProperty({ colldes: false });
      houseLayer?.setCollisionByProperty({ collides: true });
      const spawnPosition =
        this.sceneFrom === "forest" ? { x: 2080, y: 59 } : { x: 2000, y: 1100 };

      // Create the player character and define spawn position
      if (this.characterName === "barb") {
        this.barb = this.add.barb(
          spawnPosition.x,
          spawnPosition.y + 40,
          "barb"
        );
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(
          spawnPosition.x,
          spawnPosition.y + 80,
          "archer"
        );
        this.cameras.main.startFollow(this.archer);
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(
          spawnPosition.x,
          spawnPosition.y + 120,
          "wizard"
        );
        this.cameras.main.startFollow(this.wizard);
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(spawnPosition.x, spawnPosition.y, "man");
        this.cameras.main.startFollow(this.man);
      }

      // Create an array of that holds all characters to be targeted if needed
      const playerCharacters = [this.barb, this.wizard, this.archer, this.man];

      // Create a group for skeletons and set their properties
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

      // Handle collisions between skeletons and ground layers
      if (this.skeletons && groundLayer) {
        this.physics.add.collider(this.skeletons, groundLayer);
        this.physics.add.collider(
          this.projectiles,
          groundLayer,
          this.collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      // Handle collisions between skeletons and house layers
      if (this.skeletons && houseLayer) {
        this.physics.add.collider(this.skeletons, houseLayer);
        this.physics.add.collider(
          this.projectiles,
          houseLayer,
          this.collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }
      // Handle collisions between skeletons and fences
      if (this.skeletons && fenceLayer) {
        this.physics.add.collider(this.skeletons, fenceLayer);
        this.physics.add.collider(
          this.projectiles,
          fenceLayer,
          this.collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }
      // Handle collisions between skeletons and trees
      if (this.skeletons && treesLayer) {
        this.physics.add.collider(this.skeletons, treesLayer);
        this.physics.add.collider(
          this.projectiles,
          treesLayer,
          this.collisionHandler.handleProjectileWallCollision,
          undefined,
          this
        );
      }

      // Set up slimes and handle collisions
      this.slimes = this.physics.add.group({
        classType: Slime,
        createCallback: (go) => {
          const slimeGo = go as Slime;
          if (slimeGo.body) {
            slimeGo.body.onCollide = true;

            // Adjust the hitbox size here
            const hitboxWidth = 16; // Set the desired hitbox width
            const hitboxHeight = 16; // Set the desired hitbox height
            slimeGo.body.setSize(hitboxWidth, hitboxHeight);

            // Set the hitbox offset here
            const offsetX = hitboxWidth / 2; // Set the desired X offset
            const offsetY = hitboxHeight / 2; // Set the desired Y offset
            slimeGo.body.setOffset(offsetX, offsetY);
          }
        },
      });

      // Add a slime to the group
      this.slimes.get(414, 90, "slime");
      if (playerCharacters && this.slimes) {
        // Add colliders between man and slimes
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.slimes,
          this.collisionHandler.handlePlayerSlimeCollision,
          undefined,
          this
        );

        // Handle collisions between slimes and layers
        if (waterLayer) this.physics.add.collider(this.slimes, waterLayer);
        if (groundLayer) this.physics.add.collider(this.slimes, groundLayer);
        if (houseLayer) this.physics.add.collider(this.slimes, houseLayer);
        if (fenceLayer) this.physics.add.collider(this.slimes, fenceLayer);
        if (treesLayer) this.physics.add.collider(this.slimes, treesLayer);
      }
      this.dog = this.physics.add.group({
        classType: Dog,
        createCallback: (go) => {
          const DogGo = go as Dog;
          if (DogGo.body) {
            DogGo.body.onCollide = true;
          }
        },
      });
      const dog = this.dog.get(2050, 1110, "Dog");
      dog.text = "Bark!" || "Woof!" || "BARK!";
      if (playerCharacters && this.dog) {
        // Handle collisions between dogs and layers
        if (waterLayer) this.physics.add.collider(this.dog, waterLayer);
        if (groundLayer) this.physics.add.collider(this.dog, groundLayer);
        if (houseLayer) this.physics.add.collider(this.dog, houseLayer);
        if (fenceLayer) this.physics.add.collider(this.dog, fenceLayer);
        if (treesLayer) this.physics.add.collider(this.dog, treesLayer);
      }
      this.goblin = this.physics.add.group({
        classType: Goblin,
        createCallback: (go) => {
          const GoblinGo = go as Goblin;
          if (GoblinGo.body) {
            GoblinGo.body.onCollide = true;

            // Adjust the hitbox size here
            const hitboxWidth = 20; // Set the desired hitbox width
            const hitboxHeight = 20; // Set the desired hitbox height
            GoblinGo.body.setSize(hitboxWidth, hitboxHeight);

            // Set the hitbox offset here
            const offsetX = 6; // Set the desired X offset
            const offsetY = 14; // Set the desired Y offset
            GoblinGo.body.setOffset(offsetX, offsetY);
          }
        },
      });
      this.goblin.get(2080, 1110, "Goblin")
      if (playerCharacters && this.goblin) {
        // Handle collisions between goblins and layers
        if (waterLayer) this.physics.add.collider(this.goblin, waterLayer);
        if (groundLayer) this.physics.add.collider(this.goblin, groundLayer);
        if (houseLayer) this.physics.add.collider(this.goblin, houseLayer);
        if (fenceLayer) this.physics.add.collider(this.goblin, fenceLayer);
        if (treesLayer) this.physics.add.collider(this.goblin, treesLayer);
      }
      if (playerCharacters && this.skeletons) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.skeletons,
          this.collisionHandler.handlePlayerEnemyCollision as any,
          undefined,
          this
        );
      }
      // Handle collisions between player and enemy characters
      if (playerCharacters && this.playerEnemiesCollider) {
        this.playerEnemiesCollider = this.physics.add.collider(
          this.skeletons || this.goblin,
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.collisionHandler as any,
          undefined,
          this
        );
      }

      // Handle collisions
      if (playerCharacters && this.playerSlimeCollider) {
        this.playerSlimeCollider = this.physics.add.collider(
          this.slimes,
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.collisionHandler.handlePlayerSlimeCollision,
          undefined,
          this
        );
      }

      if (playerCharacters && this.goblin) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.goblin,
          this.collisionHandler.handlePlayerGoblinCollision as any,
          undefined,
          this
        );
      }

      // Handle collisions between player and layers
      if (playerCharacters) {
        //if statements are to satisfy TypeScipt compiler
        if (waterLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            waterLayer
          );
        if (groundLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            groundLayer
          );
        if (houseLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            houseLayer
          );
        if (fenceLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            fenceLayer
          );
        if (treesLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            treesLayer
          );

        // Add text for player name
        this.playerName = this.add
          .text(0, 0, "You", {
            fontSize: "14px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 1,
          })
          .setOrigin(0.5, 1);

        // Add text for player level
        this.playerLevel = this.add
          .text(0, 0, "Level: 1", {
            fontSize: "12px",
            color: "#FFD700",
            stroke: "#000000",
            strokeThickness: 1,
          })
          .setOrigin(0.5, 1);
      }

      this.Npc_wizard = this.physics.add.group({
        classType: Npc_wizard,
        createCallback: (go) => {
          const NpcGo = go as Npc_wizard;
          if (NpcGo.body) {
            NpcGo.body.onCollide = true;
          }
          // Adjust the hitbox size here
          const hitboxWidth = 70; // Set the desired hitbox width
          const hitboxHeight = 70; // Set the desired hitbox height
          NpcGo.body.setSize(hitboxWidth, hitboxHeight);

          // Set the hitbox offset here
          const offsetX = hitboxWidth * -0.25; // Set the desired X offset
          const offsetY = hitboxHeight * -0.25; // Set the desired Y offset
          NpcGo.body.setOffset(offsetX, offsetY);
        },
      });

      // #region NPC Text

      // Create an instance of Npc_wizard with specific text
      const npc1 = this.Npc_wizard.get(1880, 1142, "npcWizard");
      npc1.text =
        "Greetings, traveler! Welcome to the realm of Eternia. Seek my bretheren to learn the ways of this world.";

      const npc2 = this.Npc_wizard.get(1526, 1045, "npcWizard");
      npc2.text =
        "A fine day to you! In this world, your strength lies in teamwork. Unite with your friends to face the challenges that lie ahead.";

      const npc3 = this.Npc_wizard.get(1075, 916, "npcWizard");
      npc3.text =
        "Look yonder, weary adventurer! Potions are a vital aid on your journey. Walk over them to consume and regain your vitality.";

      const npc4 = this.Npc_wizard.get(825, 740, "npcWizard");
      npc4.text =
        "The path through the forest is treacherous, full of creatures that would wish you harm. Face them bravely, and remember to strike with 'spacebar'.";

      const npc5 = this.Npc_wizard.get(1770, 442, "npcWizard");
      npc5.text =
        "Within the forest's heart lie ancient ruins. Tread cautiously, the forgotten souls there do not take kindly to intrusion.";

      const npc6 = this.Npc_wizard.get(1193, 505, "npcWizard");
      npc6.text =
        "Beware the Skeleton King! An ageless tyrant, defeated only by the bravest of warriors. Unite, fight, conquer!";

      const npc7 = this.Npc_wizard.get(2080, 146, "npcWizard");
      npc7.text =
        "Greetings, traveler! Be warned, the path ahead weaves through an enchanted forest fraught with peril. Once you venture forth, the veil of return shall close behind you, locking away the safety of the town. Be prepared!";
      //#endregion

      this.interactKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E
      );
      this.potion = this.physics.add.group({
        classType: Potion,
        createCallback: (go) => {
          const PotionGo = go as Potion;
          if (PotionGo.body) {
            PotionGo.body.onCollide = true;
          }
        },
      });
      this.potion.get(1075, 950, "Potion");
      this.resurrect = this.physics.add.group({
        classType: Resurrect,
        createCallback: (go) => {
          const ResGo = go as Resurrect;
          if (ResGo.body) {
            ResGo.body.onCollide = true;
          }
        },
      });

      this.resurrect.get(2060, 1100, "Resurrect");

      this.slimes.get(2000, 1000, "slime");
      this.slimes.get(2000, 1000, "slime");
      this.slimes.get(2000, 1000, "slime");
      this.slimes.get(2000, 1000, "slime");
      this.slimes.get(2000, 1000, "slime");
      this.slimes.get(2000, 1000, "slime");
    }
    this.skeletons.get(2000, 1210, "jacked-skeleton");
    this.skeletons.get(2000, 1210, "jacked-skeleton");
    this.skeletons.get(2000, 1210, "jacked-skeleton");
    this.skeletons.get(2000, 1210, "jacked-skeleton");
    // Add a skeleton to the group
    if (this.characterName === "rogue") {
      console.log("Rogue host is spawning...");
      this.skeletons.get(2000, 1210, "jacked-skeleton");
      //this.skeletons.get(2000, 1220, "jacked-skeleton");
      //this.skeletons.get(2000, 1230, "jacked-skeleton");
    }
  }

  // Method to update player's experience
  public updatePlayerExp(exp: number) {
    this.exp = exp;

    // Update the player's exp value in the database
    if (this.playerRef) {
      update(this.playerRef, {
        exp: this.exp,
      });
    }
  }

  private levelUpPlayer(player: Player) {
    const expNeeded = player.level * 5 * Math.pow(1.5, player.level - 1); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
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

      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
          maxHealth: player.maxHealth,
          level: player.level,
        });
      }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpBarb(player: Barb) {
    const expNeeded = player.level * 5 * Math.pow(1.5, player.level - 1); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
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

      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
          maxHealth: player.maxHealth,
          level: player.level,
        });
      }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpArcher(player: Archer) {
    const expNeeded = player.level * 5 * Math.pow(1.5, player.level - 1); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
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

      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
          maxHealth: player.maxHealth,
          level: player.level,
        });
      }
      if (this.playerLevel) {
        this.playerLevel.text = "Level: " + player.level;
      }
      // Dispatch the event to update the health bar
      sceneEvents.emit("player-max-health-changed", player.maxHealth);
    }
  }

  private levelUpWizard(player: Wizard) {
    const expNeeded = player.level * 5 * Math.pow(1.5, player.level - 1); //Set the amout of exp need to level up to increase 1.5 times everytime the player levels up
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

      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
          maxHealth: player.maxHealth,
          level: player.level,
        });
      }
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
    this.miniMapBackground = this.add.rectangle(
      2000,
      1100,
      72,
      72,
      Phaser.Display.Color.GetColor(12, 70, 9)
    );
    this.miniMapLocation = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(255, 0, 0)
    );
    this.miniMapForest = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(0, 255, 0)
    );
    // this.miniMapBorder = this.add.rectangle(2000, 1100, 76, 76, 0xffffff).setStrokeStyle(2, 0x000000);

    const q = this.input.keyboard?.addKey("Q");
    q?.on("down", () => {
      if (
        this.miniMapBackground &&
        this.miniMapLocation &&
        this.miniMapForest
      ) {
        this.miniMapBackground.visible = !this.miniMapBackground.visible;
        this.miniMapLocation.visible = !this.miniMapLocation.visible;
        this.miniMapForest.visible = !this.miniMapForest.visible;
      }
    });
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

    // Handle Collision Between Player and Resurrect
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

    const forestX = character.x >= 2058 && character.x <= 2101;
    const forestY = character.y <= 35 && character.y >= 28.8;
    if (forestX && forestY) {

    this.scene.start("forest", { characterName: this.characterName, game: this });
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
        scene: 'forest',
      });
      return;
    }

    if (this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;

      // Position of the name above the player
      this.playerName.y = character.y - 20;

      this.playerLevel.x = this.playerName.x;
      this.playerLevel.y = character.y - 10;

      //Handle Collision Between Player and Resurrect
      this.physics.add.overlap(
        character,
        this.resurrect,
        this.collisionHandler.handlePlayerResurrectCollision as any,
        undefined,
        this
      );

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
      // Handle collision between knives and slimes
      this.physics.overlap(
        this.projectiles,
        this.slimes,
        this.collisionHandler.handleProjectileSlimeCollision as any,
        undefined,
        this
      );
      // Handle collision between knives and goblins
      this.physics.overlap(
        this.projectiles,
        this.goblin,
        this.collisionHandler.handleProjectileGoblinCollision as any,
        undefined,
        this
      );
      if (
        Phaser.Input.Keyboard.JustDown(
          this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        )
      ) {
        console.log("Player pushed E."),
          this.physics.overlap(
            character,
            this.Npc_wizard,
            this.collisionHandler.handlePlayerNpcCollision as any,
            undefined,
            this
          );
        this.physics.overlap(
          character,
          this.dog,
          this.collisionHandler.handlePlayerDogCollision as any,
          undefined,
          this
        );
      }
      // Update the player's data in the database
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
              scene: this.scene.key,
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

    if (
      this.miniMapBackground &&
      this.miniMapLocation &&
      this.map &&
      this.miniMapForest
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
      const forestLocation = this.getMiniLocation(2070, 29, character);
      this.miniMapForest.x = forestLocation.x;
      this.miniMapForest.y = forestLocation.y;
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

      const ratio = this.miniMapBackground.width / this.map.widthInPixels;
      const distanceX = x - this.map.widthInPixels / 2;
      const distanceY = y - this.map.heightInPixels / 2;
      const ratioX = distanceX * ratio;
      const ratioY = distanceY * ratio;
      return { x: centerX + ratioX, y: centerY + ratioY };
    }
    return { x: 0, y: 0 };

    if (this.updateIterations % 3 === 0) {
      for (const entry of this.enemies.entries()) {
        if (entry[1].isAlive) {
          entry[1].findTarget(this.otherPlayers, {
            x: character.x,
            y: character.y,
          });
        }
      }
    }
  }
}
