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

export default class Boss extends Phaser.Scene{
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

    constructor()
    {
        super("boss");
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