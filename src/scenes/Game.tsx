import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { createEnemyAnims } from "../anims/EnemyAnims";
//import { Player } from "../characters/Player";
import '../characters/Player'
import { Enemy } from "../enemies/Enemy";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update, onValue } from "firebase/database";
import { sceneEvents } from '../events/EventsCenter'


export default class Game extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Phaser.Physics.Arcade.Sprite;
  private knives!: Phaser.Physics.Arcade.Group
  private playerRef!: any;
  private playerId!: any;
  private otherPlayers!: Map<any, any>;
  private playerNames!: Map<any, any>;
  private playerName?: Phaser.GameObjects.Text;


  constructor() {
    super("game");
    this.otherPlayers = new Map();
    this.playerNames = new Map();
  }

  preload() {
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  create() {
    const auth = getAuth();
    this.scene.run('player-ui')

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.playerId = user.uid;
        const db = getDatabase();
        this.playerRef = ref(db, `players/${this.playerId}`);

        const otherPlayersRef = ref(db, "players");
        onValue(otherPlayersRef, (snapshot) => {
          const playersData = snapshot.val();
          for (const playerId in playersData) {
            if (playerId === this.playerId) continue;
            const playerData = playersData[playerId];
            let otherPlayer = this.otherPlayers.get(playerId);

            if (!otherPlayer) {
              otherPlayer = this.physics.add.sprite(
                playerData.x,
                playerData.y,
                "man"
              );
              this.otherPlayers.set(playerId, otherPlayer);
            }
            otherPlayer.x = playerData.x;
            otherPlayer.y = playerData.y;

            if (playerData.anim && playerData.frame) {
              otherPlayer.anims.play(playerData.anim, true);
              otherPlayer.anims.setCurrentFrame(
                otherPlayer.anims.currentAnim.frames.find(
                  (f: any) => f.frame.name === playerData.frame
                )
              );
            }
            let playerName = this.playerNames.get(playerId);
            if (!playerName) {
              playerName = this.add
                .text(0, 0, playerData.name, {
                  fontSize: "10px",
                  color: "#ffffff",
                  stroke: "#000000",
                  strokeThickness: 2,
                })
                .setOrigin(0.5, 0.01);
              this.playerNames.set(playerId, playerName);
            }
            playerName.x = otherPlayer.x;
            playerName.y = otherPlayer.y - 20;
          }
        });

      }
    });
    
    createCharacterAnims(this.anims);
    createEnemyAnims(this.anims)
    

    const map = this.make.tilemap({ key: "testMap" });
    const tileset = map.addTilesetImage("spr_grass_tileset", "tiles");

    // const map = this.make.tilemap({key: "caveMap"})
    // const tileset = map.addTilesetImage("cave", "tiles")

    if (tileset) {
      const waterLayer = map.createLayer("Water", tileset, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);
      // const cave = map.createLayer("Cave", tileset, 0, 0)

      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      objectsLayer?.setCollisionByProperty({ collides: true });

      this.man = this.add.player(600, 191, "man");

      this.skeletons = this.physics.add.group({
        classType: Enemy,
        createCallback: (go) => {
          const enemyGo = go as Enemy
          enemyGo.body.onCollide = true
          enemyGo.body.setSize(enemyGo.width, enemyGo.height)
        }
      })

      this.knives = this.physics.add.group({
        classType: Phaser.Physics.Arcade.Image,
        maxSize:3
      })

      this.man.setKnives(this.knives)

      this.skeletons.get(256,256, 'jacked-skeleton' )

      this.physics.add.collider(this.skeletons, groundLayer)
      this.physics.add.collider(this.knives, groundLayer, this.handleKnifeWallCollision, undefined, this)
		  this.physics.add.collider(this.knives, this.skeletons, this.handleKnifeSkeletonCollision, undefined, this)

      this.playerEnemiesCollider =  this.physics.add.collider(this.skeletons, 
                this.man,
                this.handlePlayerEnemyCollision, 
                undefined, 
                this)

      // this.physics.world.enableBody(
      //   this.man,
      //   Phaser.Physics.Arcade.DYNAMIC_BODY
      // );

      // if (this.man.body) {
      //   this.man.body.setSize(this.man.width * 0.8);
      // }
      // this.add.existing(this.man);

      if (this.man) {
        //if statements are to satisfy TypeScipt compiler
        if (waterLayer) this.physics.add.collider(this.man, waterLayer);
        if (groundLayer) this.physics.add.collider(this.man, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.man, objectsLayer);
        this.cameras.main.startFollow(this.man);

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

  private handleKnifeWallCollision(obj1:Phaser.GameObjects.GameObject , obj2: Phaser.GameObjects.GameObject) 
	{
    console.log(obj1.x,obj1.y)
		this.knives.killAndHide(obj1)
		obj1.destroy();
	}

	private handleKnifeSkeletonCollision(obj1:Phaser.GameObjects.GameObject , obj2: Phaser.GameObjects.GameObject) 
	{
		this.knives.killAndHide(obj1)
		this.skeletons.killAndHide(obj2)
		obj2.destroy();
		obj1.destroy();
	}

  private handlePlayerEnemyCollision(obj1:Phaser.GameObjects.GameObject , obj2: Phaser.GameObjects.GameObject) 
	{
		const skeleton = obj2 as Enemy
    
		const dx = obj1.x - skeleton.x
		const dy = obj1.y - skeleton.y
    
		const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200)
    this.man.setVelocity(dir.x, dir.y)
		this.man.handleDamage(dir)

    console.log(this.man._health)
		sceneEvents.emit('player-health-changed', this.man._health)

		// if( this.faune.health <= 0)
		// {
		// 	this.playerLizardsCollider?.destroy()
		// }
	}

  update() {
    if (this.man && this.playerName) {
      this.man.update(this.cursors);

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
        });
      }
    }
  }
}
