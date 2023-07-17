import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import { Boss } from "../enemies/Boss";
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
import BabySkeleton from "../enemies/BabySkeleton";
import Skeleton from "../enemies/Skeleton";
import Goblin from "../enemies/Goblins";
import Slime from "../enemies/Slime";

export default class BossMap extends Phaser.Scene{
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private man?: Player;
    private barb?: Barb; //Barbarian Character
    private archer?: Archer; //Archer Character
    private wizard?: Wizard; //Wizard Character
    public projectiles!: Phaser.Physics.Arcade.Group;
    public boss!: Phaser.Physics.Arcade.Group; // Group to manage Boss enemies
    public skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
    public babySkeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
    public goblin!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
    public slimes!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
    private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
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
    private enemyCount: number = 0;

    constructor()
    {
        super("bossMap");
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
      this.babySkeletons,
      this.goblin,
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

    const map = this.make.tilemap({key: "bossMap"})
    const groundTiles = map.addTilesetImage("Ruins-Terrain", "bossRuinsTerrain")
    const structureTiles = map.addTilesetImage("Ruins-Structures", "bossStructures")
    const propTiles = map.addTilesetImage("Ruins-Props", "bossRuinsProps")

    if(groundTiles && structureTiles && propTiles){
        const groundLayer = map.createLayer("Ground", groundTiles, 0, 0)
        const wallsLayer = map.createLayer("Walls", structureTiles, 0, 0)
        const platformLayer = map.createLayer("Platforms", groundTiles, 0 ,0)
        const propsLayer = map.createLayer("Props", propTiles, 0 ,0)
        const borderLayer = map.createLayer("Border", structureTiles, 0 ,0)

        groundLayer?.setCollisionByProperty({collides: true})
        wallsLayer?.setCollisionByProperty({collides: true})
        platformLayer?.setCollisionByProperty({collides: true})
        propsLayer?.setCollisionByProperty({collides: true})
        borderLayer?.setCollisionByProperty({collides: true})

        if (this.characterName === "barb") {
            this.barb = this.add.barb(600, 1150, "barb");
            this.cameras.main.startFollow(this.barb);
          } else if (this.characterName === "archer") {
            this.archer = this.add.archer(600, 1150, "archer");
            this.cameras.main.startFollow(this.archer);
          } else if (this.characterName === "wizard") {
            this.wizard = this.add.wizard(600, 1150, "wizard");
            this.cameras.main.startFollow(this.wizard);
          } else if (this.characterName === "rogue") {
            this.man = this.add.player(600, 1150, "man");
            this.cameras.main.startFollow(this.man);
          }

          const playerCharacters = [this.barb, this.wizard, this.archer, this.man];


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

          this.boss = this.physics.add.group({
            classType: Boss,
            createCallback: (go) => {
              const skeleGo = go as Boss;
              this.enemyCount++;
              if (skeleGo.body) {
                skeleGo.body.onCollide = true;
    
                // Adjust the hitbox size here
                const hitboxWidth = 40; // Set the desired hitbox width
                const hitboxHeight = 55; // Set the desired hitbox height
                skeleGo.body.setSize(hitboxWidth, hitboxHeight);
    
                // Set the hitbox offset here
                const offsetX = 12; // Set the desired X offset
                const offsetY = 8; // Set the desired Y offset
                skeleGo.body.setOffset(offsetX, offsetY);
              }
              this.enemies.set(this.enemyCount, skeleGo);
            },
          });
          if (this.characterName === "rogue") {
            this.boss.get(626, 390, "boss");

          }
          
          sceneEvents.on(
            "boss-stomp",
            () => {
    
              const boss = this.enemies.get(1)
              boss.body.setSize(80, 110);
              this.time.addEvent({
                delay: 1000,
                callback: () => {
                  if (boss.isAlive) boss.body.setSize(40, 55);
                },
                loop: false
              });
            }
          );

          sceneEvents.on(
            "boss-spin",
            () => {
    
              const boss = this.enemies.get(1)
              
              for (let i = 0; i < 3; i++) {
                if (this.enemies.size < 12) {
                  this.babySkeletons.get(boss.x+100, boss.y, "baby-skeleton");
                  this.slimes.get(boss.x-100, boss.y, "slime");
                  this.skeletons.get(boss.x+100, boss.y, "jacked-skeleton");
                  this.goblin.get(boss.x-100, boss.y, "goblin");
                }
              }
            }
          );

          // Handle collisions between boss and house layers
          if (this.boss && groundLayer) {
            this.physics.add.collider(this.boss, groundLayer);
            this.physics.add.collider(
              this.projectiles,
              groundLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between boss and fences
          if (this.boss && platformLayer) {
            this.physics.add.collider(this.boss, platformLayer);
            this.physics.add.collider(
              this.projectiles,
              platformLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between boss and trees
          if (this.boss && wallsLayer) {
            this.physics.add.collider(this.boss, wallsLayer);
            this.physics.add.collider(
              this.projectiles,
              wallsLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }

          if (playerCharacters && this.boss) {
            this.physics.add.collider(
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.boss,
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
              this.boss,
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.collisionHandler.handlePlayerEnemyCollision as any,
              undefined,
              this
            );
          }

          this.babySkeletons = this.physics.add.group({
            classType: BabySkeleton,
            createCallback: (go) => {
              const skeleGo = go as BabySkeleton;
              this.enemyCount++;
              if (skeleGo.body) {
                skeleGo.body.onCollide = true;
    
                // Adjust the hitbox size here
                const hitboxWidth = 20; // Set the desired hitbox width
                const hitboxHeight = 25; // Set the desired hitbox height
                skeleGo.body.setSize(hitboxWidth, hitboxHeight);

                // Set the hitbox offset here
                const offsetX = 6; // Set the desired X offset
                const offsetY = 7; // Set the desired Y offset
                skeleGo.body.setOffset(offsetX, offsetY);
              }
              this.enemies.set(this.enemyCount, skeleGo);
            },
          });

          // Handle collisions between skeletons and house layers
          if (this.babySkeletons && groundLayer) {
            this.physics.add.collider(this.babySkeletons, groundLayer);
            this.physics.add.collider(
              this.projectiles,
              groundLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and fences
          if (this.babySkeletons && platformLayer) {
            this.physics.add.collider(this.babySkeletons, platformLayer);
            this.physics.add.collider(
              this.projectiles,
              platformLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and trees
          if (this.babySkeletons && wallsLayer) {
            this.physics.add.collider(this.babySkeletons, wallsLayer);
            this.physics.add.collider(
              this.projectiles,
              wallsLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }

          if (playerCharacters && this.babySkeletons) {
            this.physics.add.collider(
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.babySkeletons,
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
              this.babySkeletons,
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.collisionHandler.handlePlayerEnemyCollision as any,
              undefined,
              this
            );
          }

          this.skeletons = this.physics.add.group({
            classType: Skeleton,
            createCallback: (go) => {
              const skeleGo = go as Skeleton;
              this.enemyCount++;
              if (skeleGo.body) {
                skeleGo.body.onCollide = true;
    
                // Adjust the hitbox size here
                const hitboxWidth = 20; // Set the desired hitbox width
                const hitboxHeight = 25; // Set the desired hitbox height
                skeleGo.body.setSize(hitboxWidth, hitboxHeight);

                // Set the hitbox offset here
                const offsetX = 6; // Set the desired X offset
                const offsetY = 7; // Set the desired Y offset
                skeleGo.body.setOffset(offsetX, offsetY);
              }
              this.enemies.set(this.enemyCount, skeleGo);
            },
          });

          // Handle collisions between skeletons and house layers
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
          if (this.skeletons && wallsLayer) {
            this.physics.add.collider(this.skeletons, wallsLayer);
            this.physics.add.collider(
              this.projectiles,
              wallsLayer,
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

          this.goblin = this.physics.add.group({
            classType: Goblin,
            createCallback: (go) => {
              const skeleGo = go as Goblin;
              this.enemyCount++;
              if (skeleGo.body) {
                skeleGo.body.onCollide = true;
    
                // Adjust the hitbox size here
                const hitboxWidth = 20; // Set the desired hitbox width
                const hitboxHeight = 25; // Set the desired hitbox height
                skeleGo.body.setSize(hitboxWidth, hitboxHeight);

                // Set the hitbox offset here
                const offsetX = 6; // Set the desired X offset
                const offsetY = 7; // Set the desired Y offset
                skeleGo.body.setOffset(offsetX, offsetY);
              }
              this.enemies.set(this.enemyCount, skeleGo);
            },
          });

          // Handle collisions between skeletons and house layers
          if (this.goblin && groundLayer) {
            this.physics.add.collider(this.goblin, groundLayer);
            this.physics.add.collider(
              this.projectiles,
              groundLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and fences
          if (this.goblin && platformLayer) {
            this.physics.add.collider(this.goblin, platformLayer);
            this.physics.add.collider(
              this.projectiles,
              platformLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and trees
          if (this.goblin && wallsLayer) {
            this.physics.add.collider(this.goblin, wallsLayer);
            this.physics.add.collider(
              this.projectiles,
              wallsLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }

          if (playerCharacters && this.goblin) {
            this.physics.add.collider(
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.goblin,
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
              this.goblin,
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.collisionHandler.handlePlayerEnemyCollision as any,
              undefined,
              this
            );
          }

          this.slimes = this.physics.add.group({
            classType: Slime,
            createCallback: (go) => {
              const skeleGo = go as Slime;
              this.enemyCount++;
              if (skeleGo.body) {
                skeleGo.body.onCollide = true;
    
                // Adjust the hitbox size here
                const hitboxWidth = 20; // Set the desired hitbox width
                const hitboxHeight = 25; // Set the desired hitbox height
                skeleGo.body.setSize(hitboxWidth, hitboxHeight);

                // Set the hitbox offset here
                const offsetX = 6; // Set the desired X offset
                const offsetY = 7; // Set the desired Y offset
                skeleGo.body.setOffset(offsetX, offsetY);
              }
              this.enemies.set(this.enemyCount, skeleGo);
            },
          });

          // Handle collisions between skeletons and house layers
          if (this.slimes && groundLayer) {
            this.physics.add.collider(this.slimes, groundLayer);
            this.physics.add.collider(
              this.projectiles,
              groundLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and fences
          if (this.slimes && platformLayer) {
            this.physics.add.collider(this.slimes, platformLayer);
            this.physics.add.collider(
              this.projectiles,
              platformLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }
          // Handle collisions between skeletons and trees
          if (this.slimes && wallsLayer) {
            this.physics.add.collider(this.slimes, wallsLayer);
            this.physics.add.collider(
              this.projectiles,
              wallsLayer,
              collisionHandler.handleProjectileWallCollision,
              undefined,
              this
            );
          }

          if (playerCharacters && this.slimes) {
            this.physics.add.collider(
              playerCharacters as Phaser.GameObjects.GameObject[],
              this.slimes,
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
              this.slimes,
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
            if (wallsLayer)
              this.physics.add.collider(
                playerCharacters as Phaser.GameObjects.GameObject[],
                wallsLayer
              );
            if (platformLayer)
              this.physics.add.collider(
                playerCharacters as Phaser.GameObjects.GameObject[],
                platformLayer
              );
            if (propsLayer)
              this.physics.add.collider(
                playerCharacters as Phaser.GameObjects.GameObject[],
                propsLayer
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

    if (this.characterName === "rogue" && !this.enemies.get(1).isAlive) {
      for (const entry of this.enemies.entries()) {
        if (entry[1].isAlive){
          
          entry[1].handleDamage()
        }
      }
    }

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
      
        // Handle collision between knives and baby skeletons
        this.physics.overlap(
          this.projectiles,
          this.babySkeletons,
          this.collisionHandler.handleProjectileBSCollision as any,
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

        // Handle collision between knives and goblin
        this.physics.overlap(
          this.projectiles,
          this.goblin,
          this.collisionHandler.handleProjectileGoblinCollision as any,
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

        // Handle collision between knives and skeletons
        this.physics.overlap(
          this.projectiles,
          this.boss,
          this.collisionHandler.handleProjectileBossCollision as any,
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