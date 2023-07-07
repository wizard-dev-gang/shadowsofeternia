import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { createSlimeAnims } from "../anims/SlimeAnims";
import { Slime } from "../enemies/Slime";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { update } from "firebase/database";
import { sceneEvents } from "../events/EventsCenter";

export default class Game extends Phaser.Scene {
  // private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Player; // Reference to the player character
  private knives!: Phaser.Physics.Arcade.Group; // Group to manage knives thrown by the player
  private skeletons!: Phaser.Physics.Arcade.Group; // Group to manage skeleton enemies
  // private slimes!: Phaser.Physics.Arcade.Group; // Group to manage slime enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies

  // Firebase variables
  public playerRef!: any; // Reference to the current player in Firebase
  public playerId!: any; // ID of the current player
  public otherPlayers!: Map<any, any>; // Map to store other players in the game
  public playerNames!: Map<any, any>; // Map to store player names
  public playerName?: Phaser.GameObjects.Text; // Text object to display the current player's name
  public enemies!: Map<any, any>; // Map to store enemies in the game

  constructor() {
    super("game");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
  }

  preload() {
    // this.cursors = this.input.keyboard?.createCursorKeys();
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

    // const map = this.make.tilemap({key: "caveMap"})
    // const tileset = map.addTilesetImage("cave", "tiles")

    // Create layers for the tilemap
    if (tileset) {
      const waterLayer = map.createLayer("Water", tileset, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);
      // const cave = map.createLayer("Cave", tileset, 0, 0)

      // Set collision properties for the layers
      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      objectsLayer?.setCollisionByProperty({ collides: true });

      // Create the player character and define spawn position
      this.man = this.add.player(600, 191, "man");

      // Create a group for skeletons and set their properties
      this.skeletons = this.physics.add.group({
        classType: Skeleton,
        createCallback: (go) => {
          const skeleGo = go as Skeleton;

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
        },
      });

      // Create a group for knives with a maximum size of 3
      this.knives = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize: 3,
      });

      // Set knives for the player character
      this.man.setKnives(this.knives);

      // Add a skeleton to the group
      this.skeletons.get(256, 256, "jacked-skeleton");

      // Handle collisions between skeletons and ground layers
      if (this.skeletons && groundLayer) {
        this.physics.add.collider(this.skeletons, groundLayer);
        this.physics.add.collider(
          this.knives,
          groundLayer,
          this.handleKnifeWallCollision,
          undefined,
          this
        );
      }

      // Handle collisions between skeletons and object layers
      if (this.skeletons && objectsLayer) {
        this.physics.add.collider(this.skeletons, objectsLayer);
        this.physics.add.collider(
          this.knives,
          objectsLayer,
          this.handleKnifeWallCollision,
          undefined,
          this
        );
      }

      // Set up player slimes and handle collisions
      createSlimeAnims(this.anims);
      const slimes = this.physics.add.group({
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
      slimes.get(414, 90, "slime");
      if (this.man && slimes) {
        // Add colliders between man and slimes
        this.physics.add.collider(this.man, slimes);

        // Handle collisions between slimes and layers
        if (waterLayer) this.physics.add.collider(slimes, waterLayer);
        if (groundLayer) this.physics.add.collider(slimes, groundLayer);
        if (objectsLayer) this.physics.add.collider(slimes, objectsLayer);
      }

      // Handle collisions between player and enemy characters
      this.playerEnemiesCollider = this.physics.add.collider(
        this.skeletons,
        // this.slimes, // Needs to be examined
        this.man,
        this.handlePlayerEnemyCollision,
        undefined,
        this
      );
      console.log(this.playerEnemiesCollider);

      // this.physics.world.enableBody(
      //   this.man,
      //   Phaser.Physics.Arcade.DYNAMIC_BODY
      // );

      // if (this.man.body) {
      //   this.man.body.setSize(this.man.width * 0.8);
      // }
      // this.add.existing(this.man);

      // Handle collisions between player and layers
      if (this.man) {
        //if statements are to satisfy TypeScipt compiler
        if (waterLayer) this.physics.add.collider(this.man, waterLayer);
        if (groundLayer) this.physics.add.collider(this.man, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.man, objectsLayer);
        this.cameras.main.startFollow(this.man);

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

  // Method to handle collision between knives and walls
  private handleKnifeWallCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj1 instanceof Phaser.Tilemaps.Tile) {
      // Handle collision with a tile
    } else {
      // It's a GameObjectWithBody
      const knife = obj1 as Phaser.Physics.Arcade.Image;
      console.log(knife.x, knife.y);
      this.knives.killAndHide(knife);
      knife.destroy();
    }
  }

  // private handleKnifeSkeletonCollision(
  //   obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  //   obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  // ) {
  //   const knife = obj1 as Phaser.Physics.Arcade.Image;
  //   const skeleton = obj2 as Enemy;
  //   this.knives.killAndHide(knife);
  //   this.skeletons.killAndHide(skeleton);
  //   skeleton.destroy();
  //   knife.destroy();
  // }

  // Method to handle collision between player and enemy characters
  private handlePlayerEnemyCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj1 instanceof Player && obj2 instanceof Skeleton) {
      const man = obj1 as Player;
      const skeleton = obj2 as Skeleton;

      const dx = man.x - skeleton.x;
      const dy = man.y - skeleton.y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      // console.log(man._health);
      sceneEvents.emit("player-health-changed", man.getHealth());

      //sceneEvents.emit('player-health-changed', this.Player.health)

      // if( this.faune.health <= 0)
      // {
      // 	this.playerLizardsCollider?.destroy()
      // }
    }
  }

  update() {
    if (this.man && this.playerName) {
      this.man.update();

      // Update the player's name position horizontally
      this.playerName.x = this.man.x;
      // Position of the name above the player
      this.playerName.y = this.man.y - 10;

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
    }
  }
}
