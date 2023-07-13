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

export default class Ruins extends Phaser.Scene {
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
    super("ruins");
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
  }

  create() {
    const collisionHandler = new CollisionHandler(
      this.projectiles,
      this.skeletons,
      this.slimes,
      this.time,
      this.Npc_wizard,
      this.add,
      this.potion
    );
    this.scene.run("player-ui");
        // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
        setupFirebaseAuth(this);

        // Create animations for the characters
        createCharacterAnims(this.anims);
        createEnemyAnims(this.anims);
        createPotionAnims(this.anims);

    const map = this.make.tilemap({ key: "ruinsMap" });
    const structureTiles = map.addTilesetImage("Ruins-Structures", "structures");
    const waterTiles = map.addTilesetImage("Ruins-Blood", "water");
    const terrainTiles = map.addTilesetImage("Ruins-Terrain", "ruinsTerrain");
    const templeTiles = map.addTilesetImage("Ancient-Temple", "temple");

    if (structureTiles && templeTiles && waterTiles && terrainTiles) {
    const waterLayer = map.createLayer("Water", waterTiles, 0, 0);
      const groundLayer = map.createLayer("Ground", structureTiles, 0, 0);
      const pathLayer = map.createLayer("Paths", structureTiles, 0, 0);
      const platformLayer = map.createLayer("Platform-Ground", terrainTiles, 0, 0);
      const templeLayer = map.createLayer("Temple", templeTiles, 0, 0);

      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      pathLayer?.setCollisionByProperty({ collides: true });
      platformLayer?.setCollisionByProperty({ collides: true });
      templeLayer?.setCollisionByProperty({ collides: true });
    

    if (this.characterName === "barb") {
        this.barb = this.add.barb(2000, 3100, "barb");
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(2000, 3100, "archer");
        this.cameras.main.startFollow(this.archer);
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(2000, 3100, "wizard");
        this.cameras.main.startFollow(this.wizard);
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(2000, 3100, "man");
        this.cameras.main.startFollow(this.man);
      }

      const playerCharacters = [this.barb, this.wizard, this.archer, this.man];

      this.skeletons = this.physics.add.group({
        classType: Skeleton,
        createCallback: (go) => {
          const skeleGo = go as Skeleton;
          // this.enemyCount++;
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
              // Handle collision between knives and skeletons
      this.physics.overlap(
        this.projectiles,
        this.skeletons,
        this.collisionHandler.handleProjectileSkeletonCollision as any,
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
          this.collisionHandler.handlePlayerNpcCollision,
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

