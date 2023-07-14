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
import { createResurrectAnims } from "../anims/ResurrectAnims";

export default class Game extends Phaser.Scene {
  private man?: Player; //Rogue Character
  private barb?: Barb; //Barbarian Character
  private archer?: Archer; //Archer Character
  private wizard?: Wizard; //Wizard Character
  public projectiles!: Phaser.Physics.Arcade.Group;
  public skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  private slimes!: Phaser.Physics.Arcade.Group; // Group to manage slime enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  private enemyCount: number = 0;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  public collisionHandler: CollisionHandler;
  public potion!: Potion;
  public exp: number = 0;
  public resurrect!: Resurrect;

  // Firebase variables
  public characterName?: string;
  public playerRef!: any; // Reference to the current player in Firebase
  public playerId!: any; // ID of the current player
  public otherPlayers!: Map<any, any>; // Map to store other players in the game
  public playerNames!: Map<any, any>; // Map to store player names
  public playerName?: Phaser.GameObjects.Text; // Text object to display the current player's name
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
  }

  preload() {
    // const cursors = this.input.keyboard?.createCursorKeys();
  }
  init(data?: { name: string }) {
    console.log("init data", data);
    console.log(this.input);
    this.characterName = data?.name;
  }

  create() {
    const collisionHandler = new CollisionHandler(
      this.projectiles,
      this.skeletons,
      this.slimes,
      this.time,
      this.Npc_wizard,
      this.add,
      this.potion,
      this.playerId
      // this.resurrect
    );
    this.scene.run("player-ui");

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createNpcAnims(this.anims);
    createPotionAnims(this.anims);
    createResurrectAnims(this.anims);

    //Create tilemap and tileset
    const map = this.make.tilemap({ key: "townMapV2" });
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

      // Create the player character and define spawn position
      if (this.characterName === "barb") {
        this.barb = this.add.barb(2000, 1100, "barb");
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(2000, 1100, "archer");
        this.cameras.main.startFollow(this.archer);
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(2000, 1100, "wizard");
        this.cameras.main.startFollow(this.wizard);
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(2000, 1100, "man");
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
          collisionHandler.handleProjectileWallCollision,
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
          collisionHandler.handleProjectileWallCollision,
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
          collisionHandler.handleProjectileWallCollision,
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
          collisionHandler.handleProjectileWallCollision,
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

      // Handle collisions
      if (playerCharacters && this.playerSlimeCollider) {
        console.log("create playersilmecollider");
        this.playerSlimeCollider = this.physics.add.collider(
          this.slimes,
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.collisionHandler.handlePlayerSlimeCollision,
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
            fontSize: "10px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 2,
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

      // Create an instance of Npc_wizard with specific text
      const npc1 = this.Npc_wizard.get(1876, 1028, "npcWizard");
      npc1.text =
        "Greetings, traveler! Welcome to the realm of Shadows of Eternia. Press the 'spacebar' to unleash your attacks.";

      const npc2 = this.Npc_wizard.get(1776, 1028, "npcWizard");
      npc2.text =
        "A fine day to you! In this world, your strength lies in teamwork. Unite with your friends to face the challenges that lie ahead.";

      const npc3 = this.Npc_wizard.get(1676, 1028, "npcWizard");
      npc3.text =
        "Look yonder, adventurer! Potions are a vital aid on your journey. Walk over them to consume and regain your vitality.";

      const npc4 = this.Npc_wizard.get(1576, 1028, "npcWizard");
      npc4.text =
        "The path through the forest is treacherous, full of creatures that would wish you harm. Face them bravely, and remember to strike with 'spacebar'.";

      const npc5 = this.Npc_wizard.get(1476, 1028, "npcWizard");
      npc5.text =
        "Within the forest's heart lie ancient ruins. Tread cautiously, the forgotten souls there do not take kindly to intrusion.";

      const npc6 = this.Npc_wizard.get(1376, 1028, "npcWizard");
      npc6.text =
        "Beware the Skeleton King! An ageless tyrant, defeated only by the bravest of warriors. Unite, fight, conquer!";

      const npc7 = this.Npc_wizard.get(1276, 1028, "npcWizard");
      npc7.text =
        "Safe travels, warrior! Remember, the strength of Eternia lies within you and your companions. May your journey be filled with courage and camaraderie!";

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
      this.potion.get(2062, 1023, "Potion");
      this.slimes.get(2000, 1000, "slime");
    }

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
    if (player.exp >= player.level * 10) {
      player.exp -= player.level * 10; // Decrease the player's exp by current level * 10
      player._health *= 1.25; // Increase the player's HP by 1.25 times
      player._health = Math.round(player._health); // Round the player's HP to the nearest whole number
      player.level++;
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);
      // Update the player's exp and HP in the database
      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
        });
      }
    }
  }
  private levelUpBarb(player: Barb) {
    if (player.exp >= player.level * 10) {
      player.exp -= player.level * 10; // Decrease the player's exp by current level * 10
      player._health *= 1.25; // Increase the player's HP by 1.25 times
      player._health = Math.round(player._health); // Round the player's HP to the nearest whole number
      player.level++;
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);
      // Update the player's exp and HP in the database
      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
        });
      }
    }
  }
  private levelUpArcher(player: Archer) {
    if (player.exp >= player.level * 10) {
      player.exp -= player.level * 10; // Decrease the player's exp by current level * 10
      player._health *= 1.25; // Increase the player's HP by 1.25 times
      player._health = Math.round(player._health); // Round the player's HP to the nearest whole number
      player.level++;
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);
      // Update the player's exp and HP in the database
      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
        });
      }
    }
  }
  private levelUpWizard(player: Wizard) {
    if (player.exp >= player.level * 10) {
      player.exp -= player.level * 10; // Decrease the player's exp by current level * 10
      player._health *= 1.25; // Increase the player's HP by 1.25 times
      player._health = Math.round(player._health); // Round the player's HP to the nearest whole number
      player.level++;
      console.log("You have leveled up! Level:", player.level);
      console.log("HP:", player._health);
      // Update the player's exp and HP in the database
      if (this.playerRef) {
        update(this.playerRef, {
          exp: player.exp,
          hp: player._health,
        });
      }
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

    const forestX = character.x >= 2058 && character.x <= 2101;
    const forestY = character.y <= 35 && character.y >= 28.8;
    if (forestX && forestY) {
      this.scene.start("forest", { characterName: this.characterName });
      update(this.playerRef, { scene: "forest" });
      return;
    }

    if (this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;
      // Position of the name above the player
      this.playerName.y = character.y - 10;

      //Handle Collision Between Player and Resurrect
      this.physics.add.collider(
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
