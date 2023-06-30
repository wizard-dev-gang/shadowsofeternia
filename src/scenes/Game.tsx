import Phaser from "phaser";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  update,
  onValue,
  off,
} from "firebase/database";

import { auth } from "../../lib/firebaseConfig";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private man!: Phaser.Physics.Arcade.Sprite;
  private playerRef!: any;
  private playerId!: any;
  private otherPlayers!: Map<any, any>;

  constructor() {
    super("game");
    this.otherPlayers = new Map();
  }

  preload() {}
  create() {
    const map = this.make.tilemap({ key: "testMap" });
    this.cursors = this.input.keyboard.createCursorKeys();
    const tileset = map.addTilesetImage("spr_grass_tileset", "tiles");

    // water layer goes in first to have it behind ground
    const waterLayer = map.createLayer("Water", tileset, 0, 0);
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);

    waterLayer.setCollisionByProperty({ collides: true });
    groundLayer.setCollisionByProperty({ collides: true });
    objectsLayer.setCollisionByProperty({ collides: true });

    const debugGraphics = this.add.graphics().setAlpha(0.7);

    // Yellow blocks are the ground collision boxes
    // groundLayer.renderDebug(debugGraphics, {
    //     tileColor: null,
    //     collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    // })
    // // pink? is the water collision
    // waterLayer.renderDebug(debugGraphics, {
    //     tileColor: null,
    //     collidingTileColor: new Phaser.Display.Color(200, 100, 48, 255),
    //     faceColor: new Phaser.Display.Color(50, 60, 70, 255)
    // })
    // // green boxes are the static objects collision
    // objectsLayer.renderDebug(debugGraphics, {
    //     tileColor: null,
    //     collidingTileColor: new Phaser.Display.Color(100, 200, 48, 255),
    //     faceColor: new Phaser.Display.Color(40, 30, 10, 255)
    // })

    this.man = this.physics.add.sprite(156, 128, "man", "man-walk-down-02.png");
    this.man.body.setSize(this.man.width * 0.8);
    // Idle animations
    this.anims.create({
      key: "man-idle-down",
      frames: [{ key: "man", frame: "man-walk-down-02.png" }],
    });

    this.anims.create({
      key: "man-idle-up",
      frames: [{ key: "man", frame: "man-walk-up-02.png" }],
    });

    this.anims.create({
      key: "man-idle-left",
      frames: [{ key: "man", frame: "man-walk-left-02.png" }],
    });

    this.anims.create({
      key: "man-idle-right",
      frames: [{ key: "man", frame: "man-walk-right-02.png" }],
    });

    // Walking animations
    this.anims.create({
      key: "man-walk-down",
      frames: this.anims.generateFrameNames("man", {
        start: 1,
        end: 3,
        prefix: "man-walk-down-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 20,
    });

    this.anims.create({
      key: "man-walk-left",
      frames: this.anims.generateFrameNames("man", {
        start: 1,
        end: 3,
        prefix: "man-walk-left-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 20,
    });

    this.anims.create({
      key: "man-walk-right",
      frames: this.anims.generateFrameNames("man", {
        start: 1,
        end: 3,
        prefix: "man-walk-right-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 20,
    });

    this.anims.create({
      key: "man-walk-up",
      frames: this.anims.generateFrameNames("man", {
        start: 1,
        end: 3,
        prefix: "man-walk-up-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 20,
    });

    this.man.anims.play("man-walk-up");

    this.physics.add.collider(this.man, waterLayer);
    this.physics.add.collider(this.man, groundLayer);
    this.physics.add.collider(this.man, objectsLayer);

    this.cameras.main.startFollow(this.man);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the uid
        this.playerId = user.uid;
        const db = getDatabase(); // Get the Firebase database object
        this.playerRef = ref(db, `players/${this.playerId}`); // Reference to the player in the database

        const otherPlayersRef = ref(db, "players");
        onValue(otherPlayersRef, (snapshot) => {
          const playersData = snapshot.val();
          for (let playerId in playersData) {
            if (playerId === this.playerId) continue; // Don't create a sprite for the current player
            const playerData = playersData[playerId];
            // handle other player sprites here
            let otherPlayer = this.otherPlayers.get[playerId];

            if (!otherPlayer) {
              otherPlayer = this.physics.add.sprite(
                playerData.x,
                playerData.y,
                "man",
                "man-walk-down-02.png"
              );
              this.otherPlayers.set(playerId, otherPlayer);
            }
            otherPlayer.x = playerData.x;
            otherPlayer.y = playerData.y;
          }
        });
      }
    });
  }

  update(t: number, dt: number) {
    if (!this.cursors || !this.man || !this.playerRef) return;

    const speed = 200;
    if (this.cursors.left?.isDown) {
      this.man.anims.play("man-walk-left", true);
      this.man.setVelocity(-speed, 0);
    } else if (this.cursors.right?.isDown) {
      this.man.anims.play("man-walk-right", true);
      this.man.setVelocity(speed, 0);
    } else if (this.cursors.up?.isDown) {
      this.man.anims.play("man-walk-up", true);
      this.man.setVelocity(0, -speed);
    } else if (this.cursors.down?.isDown) {
      this.man.anims.play("man-walk-down", true);
      this.man.setVelocity(0, speed);
    } else {
      this.man.play("man-walk-down", true);
      this.man.setVelocity(0, 0);
    }

    }
    create()
    {
        const map = this.make.tilemap({key: 'testMap'})
        const tileset = map.addTilesetImage('spr_grass_tileset', 'tiles')
        
        // water layer goes in first to have it behind ground
        const waterLayer = map.createLayer('Water', tileset, 0, 0)
        const groundLayer = map.createLayer('Ground', tileset, 0, 0)
        const objectsLayer = map.createLayer('Static-Objects', tileset, 0,0)

        waterLayer.setCollisionByProperty({collides: true})
        groundLayer.setCollisionByProperty({collides: true})
        objectsLayer.setCollisionByProperty({collides: true})
        
        const debugGraphics = this.add.graphics().setAlpha(0.7)

        // Yellow blocks are the ground collision boxes
        // groundLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // })
        // // pink? is the water collision
        // waterLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(200, 100, 48, 255),
        //     faceColor: new Phaser.Display.Color(50, 60, 70, 255)
        // })
        // // green boxes are the static objects collision
        // objectsLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(100, 200, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 30, 10, 255)
        // })

        this.man = this.physics.add.sprite( 156, 128, 'man', 'man-walk-down-02.png')
        this.man.body.setSize(this.man.width * .8)
        // Idle animations
        this.anims.create({
            key: 'man-idle-down',
            frames: [{key: 'man', frame: 'man-walk-down-02.png'}]
        })

        this.anims.create({
            key: 'man-idle-up',
            frames: [{key: 'man', frame: 'man-walk-up-02.png'}]
        })

        this.anims.create({
            key: 'man-idle-left',
            frames: [{key: 'man', frame: 'man-walk-left-02.png'}]
        })

        this.anims.create({
            key: 'man-idle-right',
            frames: [{key: 'man', frame: 'man-walk-right-02.png'}]
        })


        // Walking animations
        this.anims.create({
            key: 'man-walk-down',
            frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-down-0', suffix: '.png' }),
            repeat: -1,
            frameRate: 20
        })

        this.anims.create({
            key: 'man-walk-left',
            frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-left-0', suffix: '.png' }),
            repeat: -1,
            frameRate: 20
        })

        this.anims.create({
            key: 'man-walk-right',
            frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-right-0', suffix: '.png' }),
            repeat: -1,
            frameRate: 20
        })

        this.anims.create({
            key: 'man-walk-up',
            frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-up-0', suffix: '.png' }),
            repeat: -1,
            frameRate: 20
        })

        this.man.anims.play('man-walk-up')

        this.physics.add.collider(this.man, waterLayer)
        this.physics.add.collider(this.man, groundLayer)
        this.physics.add.collider(this.man, objectsLayer)

        this.cameras.main.startFollow(this.man,)
    }
    update(t: number, dt: number)
    {
        if(!this.cursors || !this.man)
        {
            return
        }

        const speed = 200
        if(this.cursors.left?.isDown)
        {
            this.man.anims.play('man-walk-left', true)
            this.man.setVelocity(-speed, 0)
        }
        else if(this.cursors.right?.isDown)
        {
            this.man.anims.play('man-walk-right', true)
            this.man.setVelocity(speed, 0)
        }
        else if (this.cursors.up?.isDown)
        {
            this.man.anims.play('man-walk-up', true)
            this.man.setVelocity(0, -speed)
        }
        else if (this.cursors.down?.isDown)
        {
            this.man.anims.play('man-walk-down', true)
            this.man.setVelocity(0, speed)
        }
        else
        {
            const parts = this.man.anims.currentAnim.key.split('-')
            parts[1] = 'idle'
            this.man.play(parts.join('-'))
            this.man.setVelocity(0,0)
        }
    }
    update(this.playerRef, { x: this.man.x, y: this.man.y });
  }

  destroy() {
    super.destroy();
    if (this.playerRef) off(this.playerRef);
  }
}
