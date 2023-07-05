import Phaser from "phaser";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { createSlimeAnims } from "../anims/SlimeAnims";
import { Player } from "../characters/Player";
import { Slime } from "../characters/Slime";
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
        if (waterLayer) this.physics.add.collider(this.man, waterLayer);
        if (groundLayer) this.physics.add.collider(this.man, groundLayer);
        if (objectsLayer) this.physics.add.collider(this.man, objectsLayer);
        this.cameras.main.startFollow(this.man);
      }
    
    createSlimeAnims(this.anims)
    const slimes = this.physics.add.group({
      classType: Slime,
      createCallback: (go)=> {
        const slimeGo = go as Slime
        slimeGo.body.onCollide = true
      }
    })
    
    slimes.get(414, 90, "slime");
    if (this.man && slimes) {
      // Add colliders between man and slimes
      this.physics.add.collider(this.man, slimes);
  
      if (waterLayer) this.physics.add.collider(slimes, waterLayer);
      if (groundLayer) this.physics.add.collider(slimes, groundLayer);
      if (objectsLayer) this.physics.add.collider(slimes, objectsLayer)
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