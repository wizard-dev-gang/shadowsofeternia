import Phaser from "phaser";
import Barb from "../characters/Barb";
import Archer from "../characters/Archer";
import Wizard from "../characters/Wizard";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Slime } from "../enemies/Slime";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import { update } from "firebase/database";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { CollisionHandler } from "./Collisions";
import { sceneEvents } from "../events/EventsCenter";
import { Potion } from "../characters/Potion";
import { createPotionAnims } from "../anims/PotionAnims";
import Game from './Game'
import { Npc_wizard } from "../characters/Npc";
import "../characters/Npc";

export default class Forest extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Player;
  private barb?: Barb; //Barbarian Character
  private archer?: Archer; //Archer Character
  private wizard?: Wizard; //Wizard Character
  public projectiles!: Phaser.Physics.Arcade.Group;
  public skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  private slimes!: Phaser.Physics.Arcade.Group; //  Group to manage slime enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  public collisionHandler: CollisionHandler;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  public potion!: Potion;
  private forestEntranceX!: number;
  private forestEntranceY!: number;
  private game?: Game

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
    super("forest");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
    this.enemies = new Map();
    this.collisionHandler = new CollisionHandler();
  }

  preload() {
    // this.cursors = this.input.keyboard?.createCursorKeys();
  }

  init(data: any) {
    this.characterName = data.characterName;
    this.game = data.game
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
    );
    this.scene.run("player-ui");

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createPotionAnims(this.anims);

    // Creating the map and tileset
    const map = this.make.tilemap({ key: "forestMap" });
    const ruinsTerrain = map.addTilesetImage("Ruins-Terrain", "ruinsTerrain");
    const ruinsProps = map.addTilesetImage("Ruins-Props", "ruinsProps");
    const grassProps = map.addTilesetImage("Grasslands-Props", "grassProps");

    if (ruinsTerrain && ruinsProps && grassProps) {
      const groundLayer = map.createLayer("Ground", ruinsTerrain, 0, 0);
      const grassLayer = map.createLayer("Grass", ruinsProps, 0, 0);
      const pathsLayer = map.createLayer("Paths", ruinsTerrain, 0, 0);
      const borderLayer = map.createLayer("Border", grassProps, 0, 0);
      const treesLayer = map.createLayer("Trees", ruinsProps, 0, 0);
      const trees2Layer = map.createLayer("Trees2", grassProps, 0, 0);
      const trees3Layer = map.createLayer("Trees3", ruinsProps, 0, 0);

      // Setting collisions on map layers
      groundLayer?.setCollisionByProperty({ collides: false });
      grassLayer?.setCollisionByProperty({ collides: false });
      pathsLayer?.setCollisionByProperty({ collides: false });
      borderLayer?.setCollisionByProperty({ collides: true });
      treesLayer?.setCollisionByProperty({ collides: true });
      trees2Layer?.setCollisionByProperty({ collides: true });
      trees3Layer?.setCollisionByProperty({ collides: true });

     
      if (this.characterName === "barb") {
        this.barb = this.add.barb(800, 3100, "barb");
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(800, 3100, "archer");
        this.cameras.main.startFollow(this.archer);
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(800, 3100, "wizard");
        this.cameras.main.startFollow(this.wizard);
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(800, 3100, "man");
        this.cameras.main.startFollow(this.man);
      }

      const playerCharacters = [this.barb, this.wizard, this.archer, this.man];

      // this.forestEntranceX = 2070; 
      // this.forestEntranceY = 29; 
      // const enemySpawn1X = playerCharacters.x >=850 && playerCharacters.x <= 870
      // const enemySpawn1Y = playerCharacters.y >= 2830 && playerCharacters.y <= 2950
      // console.log("PC X & Y", playerCharacters.x)
      // if(enemySpawn1X && enemySpawn1Y){
      //   this.slimes.get(1320, 2650, "slime");
      //   // this.slimes.get(990, 2800, "slime");
      //   // this.slimes.get(1000, 2790, "slime");
      //   // this.slimes.get(800, 3350, "slime");
      //   return
      // }

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
      // this.slimes.get(800, 3150, "slime");
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
        if (grassLayer) this.physics.add.collider(this.slimes, grassLayer);
        if (groundLayer) this.physics.add.collider(this.slimes, groundLayer);
        if (pathsLayer) this.physics.add.collider(this.slimes, pathsLayer);
        if (borderLayer) this.physics.add.collider(this.slimes, borderLayer);
        if (treesLayer) this.physics.add.collider(this.slimes, treesLayer);
        if (trees2Layer) this.physics.add.collider(this.slimes, trees2Layer);
        if (trees3Layer) this.physics.add.collider(this.slimes, trees3Layer);
      }

      // Handle collisions between player and enemy characters
      if (playerCharacters && this.playerEnemiesCollider) {
        this.playerEnemiesCollider = this.physics.add.collider(
          this.skeletons,
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.collisionHandler.handlePlayerEnemyCollision as any,
          undefined,
          this
        );
      }
      if (playerCharacters && this.playerSlimeCollider) {
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
        if (groundLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            groundLayer
          );
        if (grassLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            groundLayer
          );
        if (pathsLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            pathsLayer
          );
        if (borderLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            borderLayer
          );
        if (treesLayer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            treesLayer
          );
        if (trees2Layer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            trees2Layer
          );
        if (trees3Layer)
          this.physics.add.collider(
            playerCharacters as Phaser.GameObjects.GameObject[],
            trees3Layer
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
      this.potion = this.physics.add.group({
        classType: Potion,
        createCallback: (go) => {
          const PotionGo = go as Potion;
          if (PotionGo.body) {
            PotionGo.body.onCollide = true;
          }
        },
      });
      this.potion.get(800, 2800, "Potion");

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
      const npc1 = this.Npc_wizard.get(800, 2950, "npcWizard");
      npc1.text =
        "Traveler, beware! The forest ahead is infested with a multitude of acid slimes, their acidic touch capable of melting through armor and flesh alike. Tread with caution, for their numbers are great, and their hunger insatiable.";

      // this.potion.get(800, 2900, "Potion");
    }

  }

  update() {
    this.updateIterations++;
    let character;

    if (this.man) {
      this.man.update();
      character = this.man;
    } else if (this.barb) {
      this.barb.update();
      character = this.barb;
    } else if (this.archer) {
      this.archer.update();
      character = this.archer;
    } else if (this.wizard) {
      this.wizard.update();
      character = this.wizard;
    }
    if (!character) return;

    const enemySpawn1X = character.x >=850  && character.x <=850.3
    const enemySpawn1Y = character.y >= 2830 && character.y <= 2950
    if(enemySpawn1X && enemySpawn1Y){
      this.slimes.get(1320, 2650, "slime");
      this.slimes.get(990, 2800, "slime");
      // this.slimes.get(1000, 2790, "slime");
      // this.slimes.get(800, 3350, "slime");
      return
    }

    const forestX = character.x >= 709 && character.x <= 825;
    const forestY = character.y <= 3152 && character.y >= 3140;
    if (forestX && forestY) {
      if (this.game) this.game.sceneFrom = 'forest'
      this.scene.switch("game");
      // this.scene.get("game").events.emit("spawnAtEntrance", 2070, 29);
      return;
    }

    const ruinsX = character.x >= 647 && character.x <= 990;
    const ruinsY = character.y <= 35 && character.y >= 27;
    if (ruinsX && ruinsY) {
      this.scene.start("ruins", { characterName: this.characterName });
      return;
    }

    if (this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;
      // Position of the name above the player
      this.playerName.y = character.y - 10;

      //Handle Collision Between Player and Potions
      this.physics.overlap(
        character,
        this.potion,
        this.collisionHandler.handlePlayerPotionCollision as any,
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
  }
}
