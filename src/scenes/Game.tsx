import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Slime } from "../enemies/Slime";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import "../enemies/Skeleton";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { update } from "firebase/database";
import { sceneEvents } from "../events/EventsCenter";
import { Barb } from "../characters/Barb";
import "../characters/Barb";
import { Wizard } from "../characters/Wizard";
import "../characters/Wizard";

export default class Game extends Phaser.Scene {
  // private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Player; // Reference to the player character
  private projectiles!: Phaser.Physics.Arcade.Group;
  private skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  private slimes!: Phaser.Physics.Arcade.Group; // Group to manage slime enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  private barb?: Barb;
  private wizard?: Wizard;
  private characterName?: string;
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;

  // Firebase variables
  public playerRef!: any; // Reference to the current player in Firebase
  public playerId!: any; // ID of the current player
  public otherPlayers!: Map<any, any>; // Map to store other players in the game
  public playerNames!: Map<any, any>; // Map to store player names
  public playerName?: Phaser.GameObjects.Text; // Text object to display the current player's name
  public enemies!: Map<any, any>; // Map to store enemies in the game
  public enemyDB!: any;
  public dataToSend: any = {};
  public updateIterations = 0;
  private enemyCount = 0;

  constructor() {
    super("game");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
    this.enemies = new Map();
  }

  preload() {
    // this.cursors = this.input.keyboard?.createCursorKeys();
  }
  init(data?: { name: string }) {
    console.log("init data", data);
    this.characterName = data?.name;
  }

  create() {
    this.scene.run("player-ui");

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);

    //Create tilemap and tileset
    const map = this.make.tilemap({ key: "testMap" });
    const tileset = map.addTilesetImage("spr_grass_tileset", "tiles");
    // const map = this.make.tilemap({ key: "town-map" });
    // const tileset = map.addTilesetImage("Grasslands-Terrain", "tiles");
    // const houseTiles = map.addTilesetImage("Grasslands-Props", "houses")

    // Create layers for the tilemap
    if (tileset) {
      const waterLayer = map.createLayer("Water", tileset, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);
      // const houses = map.createLayer("Houses", houseTiles, 0, 0)
      // const pathLayer = map.createLayer("Paths", tileset, 0, 0)

      // Set collision properties for the layers
      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      objectsLayer?.setCollisionByProperty({ collides: true });
      // houses?.setCollisionByProperty({collides: true});
      // pathLayer?.setCollisionByProperty({collides: true});

      // Create the player character and define spawn position
      const barb = this.characterName === "barb";
      const wizard = this.characterName === "wizard";
      if (barb) {
        this.man = this.add.barb(580, 200, "barb");
      } else if (wizard) {
        this.man = this.add.wizard(590, 210, "wizard");
      } else {
        this.man = this.add.player(600, 191, "man");
      }
      // Camera to follow player
      this.cameras.main.startFollow(this.man);

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

      // Set projectiles for the player character
      this.man.setProjectiles(this.projectiles);

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

      // Handle collisions between skeletons and object layers
      if (this.skeletons && objectsLayer) {
        this.physics.add.collider(this.skeletons, objectsLayer);
        this.physics.add.collider(
          this.projectiles,
          objectsLayer,
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
      if (this.man && this.slimes) {
        // Add colliders between man and slimes
        this.physics.add.collider(
          this.man,
          this.slimes,
          this.handlePlayerSlimeCollision,
          undefined,
          this
        );

        // Handle collisions between slimes and layers
        if (waterLayer) this.physics.add.collider(this.slimes, waterLayer);
        if (groundLayer) this.physics.add.collider(this.slimes, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.slimes, objectsLayer);
      }

      // Handle collisions between player and enemy characters
      this.playerEnemiesCollider = this.physics.add.collider(
        this.skeletons,
        this.man,
        this.wizard,
        this.barb,
        this.handlePlayerEnemyCollision,
        undefined,
        this
      );

      this.playerSlimeCollider = this.physics.add.collider(
        this.slimes,
        this.man,
        this.wizard,
        this.barb,
        this.handlePlayerSlimeCollision,
        undefined,
        this
      );

      // Handle collisions between player and layers
      if (this.man) {
        //if statements are to satisfy TypeScipt compiler
        if (waterLayer) this.physics.add.collider(this.man, waterLayer);
        if (groundLayer) this.physics.add.collider(this.man, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.man, objectsLayer);

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
    }
  }
  // Method to handle collision between projectiles and walls
  private handleProjectileWallCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj1 instanceof Phaser.Physics.Arcade.Image) {
      const projectile = obj1 as Phaser.Physics.Arcade.Image;
      projectile.destroy();
    }
  }

  // Method to handle collision between projectiles and skeleton
  private handleProjectileSkeletonCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1 as Phaser.Physics.Arcade.Image;
    const skeleton = obj2 as Skeleton;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile);
    projectile.destroy();
    const dx = skeleton.x - projectile.x;
    const dy = skeleton.y - projectile.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    skeleton.setVelocity(dir.x, dir.y);
    skeleton.getHealth();
    skeleton.handleDamage(dir);
    if (skeleton.getHealth() <= 0) {
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
      obj1 instanceof Player ||
      Barb ||
      (Wizard && obj2 instanceof Skeleton)
    ) {
      const man = (obj1 as Player) || Barb || Wizard;
      const skeleton = obj2 as Skeleton;

      const dx = man.x - skeleton.x;
      const dy = man.y - skeleton.y;

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
    if (obj1 instanceof Player || Barb || (Wizard && obj2 instanceof Slime)) {
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
    if (this.man && this.playerName) {
      this.man.update();

      // Update the player's name position horizontally
      this.playerName.x = this.man.x;
      // Position of the name above the player
      this.playerName.y = this.man.y - 10;

      // Handle collision between knives and skeletons
      this.physics.overlap(
        this.projectiles,
        this.skeletons,
        this.handleProjectileSkeletonCollision,
        undefined,
        this
      );
      // Handle collision between knives and slimes
      this.physics.overlap(
        this.projectiles,
        this.slimes,
        this.handleProjectileSlimeCollision,
        undefined,
        this
      );

      if (this.playerRef) {
        update(this.playerRef, {
          x: this.man.x,
          y: this.man.y,
          anim: this.man.anims.currentAnim
            ? this.man.anims.currentAnim.key
            : null,
          frame: this.man.anims.currentFrame
            ? this.man.anims.currentFrame.frame.name
            : null,
          online: true,
        });
      }

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
