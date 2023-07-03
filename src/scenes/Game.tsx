import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import "../characters/Player";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update, onValue } from "firebase/database";


export default class Game extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Phaser.Physics.Arcade.Sprite;
  private playerRef!: any;
  private playerId!: any;
  private otherPlayers!: Map<any, any>;
  

  constructor() {
    super("game");
    this.otherPlayers = new Map();
  }

  preload() {
    this.cursors = this.input.keyboard?.createCursorKeys();
  }

  create() {
    const auth = getAuth();

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
          }
        });

        createCharacterAnims(this.anims);
      }
    });

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
      


      if (this.man) {
        if (waterLayer) this.physics.add.collider(this.man, waterLayer);
        if (groundLayer) this.physics.add.collider(this.man, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.man, objectsLayer);
        this.cameras.main.startFollow(this.man);
      }
    }

  }

  update() {
    if (this.man) {
      this.man.update(this.cursors);

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
