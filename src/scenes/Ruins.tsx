import Phaser from "phaser"

export default class Ruins extends Phaser.Scene {
    constructor()
    {
        super("ruins")

    }

    create(){
        this.scene.run("player-ui")

        const map = this.make.tilemap({key: "ruinsMap"})
        const structureTiles = map.addTilesetImage("Ruins-Structures", "structures")
        const templeTiles = map.addTilesetImage("Ancient-Temple", "temple" )

        if(structureTiles && templeTiles){
            const groundLayer = map.createLayer("Ground", structureTiles, 0, 0)
            const pathLayer = map.createLayer("Paths", structureTiles, 0, 0)
            const templeLayer = map.createLayer("Temple", templeTiles, 0, 0)

            groundLayer?.setCollisionByProperty({collides: true})
            pathLayer?.setCollisionByProperty({collides: true})
            templeLayer?.setCollisionByProperty({collides: true})
        }
    }

    update(){

    }
    
}