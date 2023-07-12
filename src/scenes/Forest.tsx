import Phaser from "phaser"
import { Player } from "../characters/Player";


export default class Forest extends Phaser.Scene {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private man?: Player;

    init(data: any) {
        this.man = data.player;
    }

    constructor(){
        super("forest");

    }

    preload() {
    this.cursors = this.input.keyboard?.createCursorKeys();

    }
    create(){
        this.scene.run("player-ui")

        // Creating the map and tileset
        const map = this.make.tilemap({key: "forestMap"})
        const ruinsTerrain = map.addTilesetImage("Ruins-Terrain", "ruinsTerrain")
        const ruinsProps = map.addTilesetImage("Ruins-Props", "ruinsProps")
        const grassProps = map.addTilesetImage("Grasslands-Props", "grassProps")

        if(ruinsTerrain && ruinsProps && grassProps) {
            const groundLayer = map.createLayer("Ground", ruinsTerrain, 0,0)
            const grassLayer = map.createLayer("Grass", ruinsProps, 0, 0)
            const treesLayer = map.createLayer("Trees", ruinsProps, 0, 0)
            const trees2Layer = map.createLayer("Trees2", grassProps, 0 ,0)
            const trees3Layer = map.createLayer("Trees3", ruinsProps, 0, 0)

            // Setting collisions on map layers
            groundLayer?.setCollisionByProperty({collides: false})
            grassLayer?.setCollisionByProperty({collides: false})
            treesLayer?.setCollisionByProperty({collides: true})
            trees2Layer?.setCollisionByProperty({collides: true})
            trees3Layer?.setCollisionByProperty({collides: true})

            this.man = new Player(this, 200, 200, "barb");
      
      this.physics.world.enableBody(
        this.man,
        Phaser.Physics.Arcade.DYNAMIC_BODY
      );
      if (this.man.body) {
        this.man.body.setSize(this.man.width * 0.8);
      }
      this.add.existing(this.man);
      this.cameras.main.startFollow(this.man);
        }
    }
    update(){
        if (this.man) {
            this.man.update(this.cursors);
          }
    }

}

