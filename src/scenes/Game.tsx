import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import "../characters/Player";
import { debugDraw } from "../utils/Debug";
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

  preload() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    const auth = getAuth(); // Get the Firebase auth object

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get the uid
        this.playerId = user.uid;
        const db = getDatabase(); // Get the Firebase database object
        this.playerRef = ref(db, `players/${this.playerId}`); // Reference to the player in the database

        const otherPlayersRef = ref(db, "players");
        onValue(otherPlayersRef, (snapshot) => {
          const playersData = snapshot.val();
          for (const playerId in playersData) {
            if (playerId === this.playerId) continue; // Don't create a sprite for the current player
            const playerData = playersData[playerId];
            // handle other player sprites here
            let otherPlayer = this.otherPlayers.get(playerId);

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

        createCharacterAnims(this.anims);
      }
    });

    const map = this.make.tilemap({ key: "testMap" });
    const tileset = map.addTilesetImage("spr_grass_tileset", "tiles");

    // water layer goes in first to have it behind ground
    const waterLayer = map.createLayer("Water", tileset, 0, 0);
    const groundLayer = map.createLayer("Ground", tileset, 0, 0);
    const objectsLayer = map.createLayer("Static-Objects", tileset, 0, 0);

    waterLayer.setCollisionByProperty({ collides: true });
    groundLayer.setCollisionByProperty({ collides: true });
    objectsLayer.setCollisionByProperty({ collides: true });

    //debugDraw(groundLayer, this)

    this.man = this.add.player(600, 191, "man");

    this.physics.add.collider(this.man, waterLayer);
    this.physics.add.collider(this.man, groundLayer);
    this.physics.add.collider(this.man, objectsLayer);

    this.cameras.main.startFollow(this.man);
  }

  update(t: number, dt: number) {
    if (this.man) {
      this.man.update(this.cursors);

      if (this.playerRef) {
        update(this.playerRef, { x: this.man.x, y: this.man.y });
      }
    }
  }
}
