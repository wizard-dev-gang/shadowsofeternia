import Phaser from "phaser";
import Barb from "../characters/Barb";
import Archer from "../characters/Archer";
import Wizard from "../characters/Wizard";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Slime } from "../enemies/Slime";
import { Goblin } from "../enemies/Goblins";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { Player } from "../characters/Player";
import { update } from "firebase/database";
import { setupFirebaseAuth } from "../utils/gameOnAuth";
import { CollisionHandler } from "./Collisions";
import { sceneEvents } from "../events/EventsCenter";
import { Potion } from "../characters/Potion";
import { Resurrect } from "../characters/Resurrect";
import "../characters/Resurrect";
import { createResurrectAnims } from "../anims/ResurrectAnims";
import { createPotionAnims } from "../anims/PotionAnims";
import Game from "./Game";
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
  private goblins!: Phaser.Physics.Arcade.Group; //  Group to manage goblin enemies
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider; // Collider between player and enemies
  private playerSlimeCollider?: Phaser.Physics.Arcade.Collider;
  public collisionHandler: CollisionHandler;
  private Npc_wizard!: Phaser.Physics.Arcade.Group;
  public potion!: Potion;
  public resurrect!: Resurrect;
  private enemyCount: number = 0;
  private forestEntranceX!: number;
  private forestEntranceY!: number;
  public map?: Phaser.Tilemaps.Tilemap;
  public miniMapBackground?: Phaser.GameObjects.Rectangle;
  public miniMapRuins?: Phaser.GameObjects.Arc;
  public miniMapLocation?: Phaser.GameObjects.Arc;

  private game?: Game;
  private enemiesSpawned = false;
  private collideSound: Phaser.Sound.BaseSound;
  private resurrectSound: Phaser.Sound.BaseSound;
  private potionSound: Phaser.Sound.BaseSound;
  private slimeDeathSound: Phaser.Sound.BaseSound;
  private npcHm: Phaser.Sound.BaseSound;
  private resurrectSound: Phaser.Sound.BaseSound;

  // Firebase variables
  public characterName?: string;
  public characterLevel?: number;
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
    this.load.audio("enemyCollide", "music/playerDmg2.mp3");
    this.load.audio("resurrect", "music/resurrectSound.mp3");
    this.load.audio("potion", "music/potion.mp3");
    this.load.audio("playerDeadSound", "/music/playerIsDead.mp3");
    this.load.audio("forestScene", "/music/forestScene.mp3");
    this.load.audio("slimeDeathSound", "/music/slimeDeathSound.mp3");
    this.load.audio("npcHm", "/music/npcHm.mp3");
    this.load.audio("projectileHit", "/music/projectileHit.mp3");
  }

  init(data: any) {
    this.characterName = data.characterName;
    this.characterLevel = data.level;
    this.game = data.game;
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
      this.playerId,
      this.resurrect,
      this.collideSound,
      this.resurrectSound,
      this.potionSound,
      this.slimeDeathSound,
      this.npcHm,
      this.projectileHit
    );
    this.scene.run("player-ui");
    this.collideSound = this.sound.add("enemyCollide");
    this.resurrectSound = this.sound.add("resurrect");
    this.potionSound = this.sound.add("potion");
    this.slimeDeathSound = this.sound.add("slimeDeathSound");
    this.npcHm = this.sound.add("npcHm");
    this.projectileHit = this.sound.add("projectileHit");

    const backgroundMusic = this.sound.add("forestScene", {
      volume: 0.5,
      loop: true,
    });
    backgroundMusic.play();

    // Set up Firebase authentication state change listener(/utils/gameOnAuth.ts)
    setupFirebaseAuth(this);

    // Create animations for the characters
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims);
    createPotionAnims(this.anims);
    createResurrectAnims(this.anims);

    // Creating the map and tileset
    const map = this.make.tilemap({ key: "forestMap" });
    this.map = map;
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
        this.barb.level = this.characterLevel;
        this.cameras.main.startFollow(this.barb);
      } else if (this.characterName === "archer") {
        this.archer = this.add.archer(800, 3100, "archer");
        this.cameras.main.startFollow(this.archer);
        this.archer.level = this.characterLevel;
      } else if (this.characterName === "wizard") {
        this.wizard = this.add.wizard(800, 3100, "wizard");
        this.cameras.main.startFollow(this.wizard);
        this.wizard.level = this.characterLevel;
      } else if (this.characterName === "rogue") {
        this.man = this.add.player(800, 3100, "man");
        this.man.level = this.characterLevel;
        this.cameras.main.startFollow(this.man);
      }

      const playerCharacters = [this.barb, this.wizard, this.archer, this.man];

      this.forestEntranceX = 2070;
      this.forestEntranceY = 29;

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
          this.enemyCount++;
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
          this.enemies.set(this.enemyCount, slimeGo);
        },
      });

      // Add a slime to the group
      // this.slimes.get(800, 3150, "slime");
      if (playerCharacters && this.slimes) {
        // Add colliders between man and slimes
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.slimes,
          this.collisionHandler.handlePlayerSlimeCollision as any,
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

      // Set up goblins and handle collisions
      this.goblins = this.physics.add.group({
        classType: Goblin,
        createCallback: (go) => {
          const goblinGo = go as Goblin;
          if (goblinGo.body) {
            goblinGo.body.onCollide = true;

            // Adjust the hitbox size here
            const hitboxWidth = 20;
            const hitboxHeight = 20;
            goblinGo.body.setSize(hitboxWidth, hitboxHeight);

            // Set the hitbox offset here
            const offsetX = 6;
            const offsetY = 14;
            goblinGo.body.setOffset(offsetX, offsetY);
          }
        },
      });

      if (playerCharacters && this.goblins) {
        // Handle collisions between goblins and layers
        if (grassLayer) this.physics.add.collider(this.goblins, grassLayer);
        if (groundLayer) this.physics.add.collider(this.goblins, groundLayer);
        if (pathsLayer) this.physics.add.collider(this.goblins, pathsLayer);
        if (borderLayer) this.physics.add.collider(this.goblins, borderLayer);
        if (treesLayer) this.physics.add.collider(this.goblins, treesLayer);
        if (trees2Layer) this.physics.add.collider(this.goblins, trees2Layer);
        if (trees3Layer) this.physics.add.collider(this.goblins, trees3Layer);
      }

      // Handle collisions between player and enemy characters
      if (playerCharacters && this.playerEnemiesCollider) {
        this.playerEnemiesCollider = this.physics.add.collider(
          this.skeletons || this.goblins,
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
          this.collisionHandler.handlePlayerSlimeCollision as any,
          undefined,
          this
        );
      }
      if (playerCharacters && this.goblins) {
        this.physics.add.collider(
          playerCharacters as Phaser.GameObjects.GameObject[],
          this.goblins,
          this.collisionHandler.handlePlayerGoblinCollision as any,
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

      this.resurrect = this.physics.add.group({
        classType: Resurrect,
        createCallback: (go) => {
          const ResGo = go as Resurrect;
          if (ResGo.body) {
            ResGo.body.onCollide = true;
          }
        },
      });

      this.resurrect.get(820, 2800, "Resurrect");
      this.resurrect.get(1690, 2640, "Resurrect");
      this.resurrect.get(1220, 1540, "Resurrect");
      this.resurrect.get(725, 165, "Resurrect");

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

      const npc2 = this.Npc_wizard.get(1455, 1466, "npcWizard");
      npc2.text = "The path ahead splits in two, adventurer. Choose wisely!";

      const npc3 = this.Npc_wizard.get(840, 178, "npcWizard");
      npc3.text =
        "Beware, brave adventurer, for beyond this treacherous path lie the ancient ruins of a forgotten civilization. Tread lightly, for the spirits of the past still haunt those crumbling halls.";

      // this.potion.get(800, 2900, "Potion");
    }

    this.miniMapBackground = this.add.rectangle(
      2000,
      1100,
      72,
      72,
      Phaser.Display.Color.GetColor(12, 70, 9)
    );
    this.miniMapBackground.setAlpha(0.6);
    this.miniMapBackground.setVisible(false);

    this.miniMapLocation = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(255, 0, 0)
    );
    this.miniMapLocation.setVisible(false);

    this.miniMapRuins = this.add.circle(
      0,
      0,
      2,
      Phaser.Display.Color.GetColor(0, 255, 0)
    );
    this.miniMapRuins.setVisible(false);

    const q = this.input.keyboard?.addKey("Q");
    q?.on("down", () => {
      if (this.miniMapBackground && this.miniMapLocation && this.miniMapRuins) {
        this.miniMapBackground.setVisible(true);
        this.miniMapLocation.setVisible(true);
        this.miniMapRuins.setVisible(true);
      }
    });

    q?.on("up", () => {
      if (this.miniMapBackground && this.miniMapLocation && this.miniMapRuins) {
        this.miniMapBackground.setVisible(false);
        this.miniMapLocation.setVisible(false);
        this.miniMapRuins.setVisible(false);
      }
    });
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

    if (
      character.y >= 2940 &&
      character.y <= 3000 &&
      this.slimes.countActive() === 0 &&
      this.goblins.countActive() === 0
    ) {
      this.slimes.get(1180, 2605, "slime");
      this.slimes.get(1180, 2605, "slime");
      this.slimes.get(1180, 2605, "slime");
      this.slimes.get(1180, 2605, "slime");
      this.goblins.get(1270, 2700, "goblin");
      this.goblins.get(1300, 2700, "goblin");
    } else if (
      character.y >= 2455 &&
      character.y <= 2470 &&
      this.slimes.countActive() <= 4 &&
      this.goblins.countActive() <= 2
    ) {
      this.slimes.get(1805, 2100, "slime");
      this.slimes.get(1805, 2100, "slime");
      this.slimes.get(1805, 2100, "slime");
      this.slimes.get(1805, 2100, "slime");
    } else if (
      character.y >= 1660 &&
      character.y <= 1680 &&
      this.slimes.countActive() <= 8 &&
      this.goblins.countActive() <= 4
    ) {
      this.slimes.get(1500, 1505, "slime");
      this.slimes.get(1500, 1505, "slime");
      this.slimes.get(1500, 1505, "slime");
      this.slimes.get(1500, 1505, "slime");
      this.goblins.get(1500, 1505, "goblin");
      this.goblins.get(1500, 1505, "goblin");
    } else if (
      character.y >= 710 &&
      character.y <= 730 &&
      this.slimes.countActive() <= 12 &&
      this.goblins.countActive() <= 6
    ) {
      this.slimes.get(847, 276, "slime");
      this.slimes.get(857, 267, "slime");
      this.slimes.get(847, 276, "slime");
      this.slimes.get(857, 267, "slime");
      this.goblins.get(857, 267, "goblin");
      this.goblins.get(857, 267, "goblin");
      this.goblins.get(857, 267, "goblin");
    }

    this.enemiesSpawned = true;

    const ruinsX = character.x >= 647 && character.x <= 990;
    const ruinsY = character.y <= 35 && character.y >= 27;
    if (ruinsX && ruinsY) {
      this.sound.stopAll();
      this.scene.start("ruins", {
        characterName: this.characterName,
        level: character.level,
      });
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
        scene: "ruins",
        level: character.level,
      });
      return;
    }

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

    if (this.playerName) {
      // Update the player's name position horizontally
      this.playerName.x = character.x;
      // Position of the name above the player
      this.playerName.y = character.y - 10;

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
        this.goblins,
        this.collisionHandler.handleProjectileGoblinCollision as any,
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
          scene: this.scene.key,
          level: character.level,
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
              level: character.level,
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
            isDead: character.isDead
          });
        }
      }
    }

    if (
      this.miniMapBackground &&
      this.miniMapLocation &&
      this.map &&
      this.miniMapRuins
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
      const ruinsLocation = this.getMiniLocation(830, 73, character);
      this.miniMapRuins.x = ruinsLocation.x;
      this.miniMapRuins.y = ruinsLocation.y;
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
      // console.log(this.map.widthInPixels, this.map.heightInPixels);

      const ratioX = this.miniMapBackground.width / this.map.widthInPixels;
      const ratioY = this.miniMapBackground.height / this.map.heightInPixels;
      const distanceX = x - this.map.widthInPixels / 2;
      const distanceY = y - this.map.heightInPixels / 2;
      const scaledX = distanceX * ratioX;
      const scaledY = distanceY * ratioY;
      return { x: centerX + scaledX, y: centerY + scaledY };
    }
    return { x: 0, y: 0 };
  }
}
