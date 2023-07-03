import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { Player } from "../characters/Player";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update, onValue } from "firebase/database";

export default class Game extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private man?: Phaser.Physics.Arcade.Sprite;
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

        createCharacterAnims(this.anims);
      }
    });

    const map = this.make.tilemap({ key: "testMap" });
    const tileset = map.addTilesetImage("spr_grass_tileset", "tiles");

    if (tileset) {
      const waterLayer = map.createLayer("Water", tileset, 0, 0);
      const groundLayer = map.createLayer("Ground", tileset, 0, 0);
      const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);

      waterLayer?.setCollisionByProperty({ collides: true });
      groundLayer?.setCollisionByProperty({ collides: true });
      objectsLayer?.setCollisionByProperty({ collides: true });

      this.man = new Player(this, 600, 191, "man");
      this.physics.world.enableBody(
        this.man,
        Phaser.Physics.Arcade.DYNAMIC_BODY
      );
      if (this.man.body) {
        this.man.body.setSize(this.man.width * 0.8);
      }
      this.add.existing(this.man);

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
