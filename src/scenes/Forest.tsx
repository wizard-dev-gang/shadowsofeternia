import Phaser from "phaser"
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Slime } from "../enemies/Slime";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import Barb from "../characters/Barb";
import Archer from "../characters/Archer";
import Wizard from "../characters/Wizard";
import { CollisionHandler } from "./Collisions";
import { Skeleton } from "../enemies/Skeleton";
import { Npc_wizard } from "../characters/Npc";



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
    private collisionHandler: CollisionHandler;
    private Npc_wizard!: Phaser.Physics.Arcade.Group;

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

    init(data: any) {
      this.characterName = data.characterName
    }

    constructor(){
        super("forest");
        this.otherPlayers = new Map();
        this.playerNames = new Map();
        this.enemies = new Map();
        this.collisionHandler = new CollisionHandler();

    }

    preload() {
    this.cursors = this.input.keyboard?.createCursorKeys();

    }
    create(){
      this.scene.run("player-ui")
        const collisionHandler = new CollisionHandler(
          this.projectiles,
          this.skeletons,
          this.slimes,
          this.time,
          this.Npc_wizard,
          this.add,
        );


            // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);


        // Creating the map and tileset
        const map = this.make.tilemap({key: "forestMap"})
        const ruinsTerrain = map.addTilesetImage("Ruins-Terrain", "ruinsTerrain")
        const ruinsProps = map.addTilesetImage("Ruins-Props", "ruinsProps")
        const grassProps = map.addTilesetImage("Grasslands-Props", "grassProps")

        if(ruinsTerrain && ruinsProps && grassProps) {
            const groundLayer = map.createLayer("Ground", ruinsTerrain, 0,0)
            const grassLayer = map.createLayer("Grass", ruinsProps, 0, 0)
            const pathsLayer = map.createLayer("Paths", ruinsTerrain, 0, 0)
            const treesLayer = map.createLayer("Trees", ruinsProps, 0, 0)
            const trees2Layer = map.createLayer("Trees2", grassProps, 0 ,0)
            const trees3Layer = map.createLayer("Trees3", ruinsProps, 0, 0)

            // Setting collisions on map layers
            groundLayer?.setCollisionByProperty({collides: false})
            grassLayer?.setCollisionByProperty({collides: false})
            pathsLayer?.setCollisionByProperty({collides: false})
            treesLayer?.setCollisionByProperty({collides: true})
            trees2Layer?.setCollisionByProperty({collides: true})
            trees3Layer?.setCollisionByProperty({collides: true})

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
            this.slimes.get(800, 3150, "slime");
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
              if (pathsLayer) this.physics.add.collider(this.slimes, pathsLayer)
              if (treesLayer) this.physics.add.collider(this.slimes, treesLayer);
              if (trees2Layer) this.physics.add.collider(this.slimes, trees2Layer);
              if (trees3Layer) this.physics.add.collider(this.slimes, trees3Layer);
            }
            if (this.man && this.playerSlimeCollider) {
              console.log('create playersilmecollider')
              this.playerSlimeCollider = this.physics.add.collider(
                this.slimes,
                this.man,
                // this.wizard,
                // this.barb,
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
    }
  }
          // Method to handle collision between player and enemy characters
    private handlePlayerEnemyCollision(
      obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
      obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
    ) {
      console.log('handleplayerEnemyCollision')
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


      
    //   this.physics.world.enableBody(
    //     this.character,
    //     Phaser.Physics.Arcade.DYNAMIC_BODY
    //   );
    //   if (this.character.body) {
    //     this.character.body.setSize(this.character.width * 0.8);
    //   }
    //   this.add.existing(this.character);
    //   this.cameras.main.startFollow(this.character);
    //     }
    // }
    update(){

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

      

    }

}

