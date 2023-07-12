import Phaser from "phaser"
import { Player } from "../characters/Player";
import Barb from "../characters/Barb";
import Archer from "../characters/Archer";
import Wizard from "../characters/Wizard";


export default class Forest extends Phaser.Scene {
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private man?: Player;
    private character?: Barb | Archer | Wizard
    private characterName?: string

    init(data: any) {
      this.characterName = data.characterName
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

            // this.man = new Player(this, 200, 200, "barb");
            if (this.characterName === 'barb') {
              this.character =  this.add.barb(2000, 1100, "barb");
            } else if (this.characterName === 'archer') {
              this.character = this.add.archer(2000, 1100, 'archer')
            } else {
              this.character = this.add.wizard(2000, 1100, 'wizard')
            }
      
      this.physics.world.enableBody(
        this.character,
        Phaser.Physics.Arcade.DYNAMIC_BODY
      );
      if (this.character.body) {
        this.character.body.setSize(this.character.width * 0.8);
      }
      this.add.existing(this.character);
      this.cameras.main.startFollow(this.character);
        }
    }
    update(){
        if (this.character) {
            this.character?.update();
          }
    }

}

