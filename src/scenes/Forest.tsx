import Phaser from "phaser"

export default class Forest extends Phaser.Scene {
    constructor(){
        super("forest");

    }

    preload() {
        
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
        }
    }
    update(){
            
    }

}