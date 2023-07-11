import Phaser, { GameObjects } from "phaser";
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

export default class Game extends Phaser.Scene {
  private man?: Player; // Reference to the player character
  private barb?: Barb;
  private archer?: Archer;
  private wizard?: Wizard;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  private slimes!: Phaser.Physics.Arcade.Group; // Group to manage slime enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  private enemyCount: number = 0;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  // private interactKey = this.input.keyboard.addKey(
  //   Phaser.Input.Keyboard.KeyCodes.E
  // );

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
    this.scene.run("player-ui");

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createNpcAnims(this.anims);

    //Create tilemap and tileset
    const map = this.make.tilemap({ key: "townMapV2" });
    const tileset = map.addTilesetImage("Grasslands-Terrain", "terrain");
    const propTiles = map.addTilesetImage("Grasslands-Props", "props");
    const waterTiles = map.addTilesetImage("Grasslands-Water", "water");

    // Create layers for the tilemap
    if (tileset && propTiles && waterTiles) {
      const waterLayer = map.createLayer("Water", waterTiles, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const pathLayer = map.createLayer("Paths", tileset, 0, 0);
      const treesLayer = map.createLayer("Trees", propTiles, 0, 0);
      const bushesLayer = map.createLayer("Bushes", propTiles, 0, 0);
      const fenceLayer = map.createLayer("Fences", propTiles, 0, 0);
      const houseLayer = map.createLayer("Houses", propTiles, 0, 0);

      // Set collision properties for the layers
      pathLayer?.setCollisionByProperty({ colldes: false });
      bushesLayer?.setCollisionByProperty({ colldes: false });
      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      houseLayer?.setCollisionByProperty({ collides: true });
      fenceLayer?.setCollisionByProperty({ collides: true });
      treesLayer?.setCollisionByProperty({ collides: true });

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
        maxSize: 3,
      });

      // Set knives for the player character
      if (this.man) {
        this.man.setProjectiles(this.projectiles);
      }

      // Add a skeleton to the group
      this.skeletons.get(256, 256, "jacked-skeleton");
      this.skeletons.get(256, 256, "jacked-skeleton");
      this.skeletons.get(256, 256, "jacked-skeleton");

      // Handle collisions between skeletons and ground layers
      if (this.skeletons && groundLayer) {
        this.physics.add.collider(this.skeletons, groundLayer);
        this.physics.add.collider(
          this.projectiles,
          groundLayer,
          this.handleProjectileWallCollision,
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
          this.handleProjectileWallCollision,
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
          this.handleProjectileWallCollision,
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
          this.handleProjectileWallCollision,
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
          this.handlePlayerSlimeCollision,
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

      // Handle collisions between player and enemy characters
      if (this.man && this.playerEnemiesCollider) {
        this.playerEnemiesCollider = this.physics.add.collider(
          this.skeletons,
          this.man,
          // this.wizard,
          // this.barb,
          this.handlePlayerEnemyCollision,
          undefined,
          this
        );
      }

      // Handle collisions
      if (this.man && this.playerSlimeCollider) {
        this.playerSlimeCollider = this.physics.add.collider(
          this.slimes,
          this.man,
          // this.wizard,
          // this.barb,
          this.handlePlayerSlimeCollision,
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
        },
      });
      this.Npc_wizard.get(880, 112, "npcWizard");
      // if (this.interactKey) {
      //   return this.interactKey;
      // }
    }
  }

  // private handlePlayerNpcCollision(
  //   player: Phaser.GameObjects.GameObject,
  //   npc: Phaser.GameObjects.GameObject
  // ) {
  //   // Check if the player is the wizard character and the NPC is the wizard
  //   if (
  //     player instanceof Player ||
  //     Wizard ||
  //     (Barb && npc instanceof Npc_wizard)
  //   ) {
  //     // Perform actions for interacting with the NPC
  //     console.log("Interacting with the NPC Wizard");
  //   }
  // }

  // Method to handle collision between projectiles and walls
  private handleProjectileWallCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj1 instanceof Phaser.GameObjects.Image) {
      const projectile = obj1 as Phaser.GameObjects.Image;
      projectile.destroy();
    }
  }

  // Method to handle collision between projectiles and skeleton
  private handleProjectileSkeletonCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1;
    const skeleton = obj2;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile as GameObjects.Image);
    projectile.destroy();
    const dx =
      (skeleton as Phaser.GameObjects.Image).x -
      (projectile as Phaser.GameObjects.Image).x;
    const dy =
      (skeleton as Phaser.GameObjects.Image).y -
      (projectile as Phaser.GameObjects.Image).y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    (skeleton as Skeleton).setVelocity(dir.x, dir.y);
    (skeleton as Skeleton).getHealth();
    (skeleton as Skeleton).handleDamage(dir);
    if ((skeleton as Skeleton).getHealth() <= 0) {
      this.skeletons.killAndHide(skeleton);
      skeleton.destroy();
    }
  }

  private handleProjectileSlimeCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1 as Phaser.Physics.Arcade.Image;
    const slime = obj2 as Slime;

    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile);
    projectile.destroy();

    // Stop the slime from moving
    slime.isMoving = false;

    // Play slime death animation
    if (slime.anims) {
      slime.anims.play("slime-death");
    }

    // Kill and hide the slime after the animation completes
    this.time.delayedCall(1000, () => {
      this.slimes.killAndHide(slime);
      slime.destroy();
    });
  }

  // Method to handle collision between player and enemy characters
  private handlePlayerEnemyCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (
      (obj1 instanceof Player || Barb || Wizard) &&
      obj2 instanceof Skeleton
    ) {
      const man = (obj1 as Player) || Barb || Wizard;
      const skeleton = obj2 as Skeleton;

      const dx =
        (man as Phaser.GameObjects.Image).x -
        (skeleton as Phaser.GameObjects.Image).x;
      const dy =
        (man as Phaser.GameObjects.Image).y -
        (skeleton as Phaser.GameObjects.Image).y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      // console.log(man._health);
      sceneEvents.emit("player-health-changed", man.getHealth());
    }
  }

  private handlePlayerSlimeCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if ((obj1 instanceof Player || Barb || Wizard) && obj2 instanceof Slime) {
      const man = (obj1 as Player) || Barb || Wizard;
      const slime = obj2 as Slime;

      const dx = man.x - slime.x;
      const dy = man.y - slime.y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      sceneEvents.emit("player-health-changed", man.getHealth());
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
      character = this.barb;
    } else if (this.wizard) {
      this.wizard.update();
      character = this.wizard;
    }

    if (character && this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;
      // Position of the name above the player
      this.playerName.y = character.y - 10;

      // Handle collision between knives and skeletons
      this.physics.overlap(
        this.projectiles,
        this.skeletons,
        this.handleProjectileSkeletonCollision as any,
        undefined,
        this
      );
      // Handle collision between knives and slimes
      this.physics.overlap(
        this.projectiles,
        this.slimes,
        this.handleProjectileSlimeCollision as any,
        undefined,
        this
      );
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
        });
      }
    }

    if (this.characterName === "rogue") {
      if (this.updateIterations % 3 === 0) {
        for (const entry of this.enemies.entries()) {
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
            alive: true,
          };
        }
        update(this.enemyDB, this.dataToSend);
      }
    }
  }
}
