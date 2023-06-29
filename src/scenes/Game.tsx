import Phaser from 'phaser';

export default class Game extends Phaser.Scene
{
    constructor()
    {
        super('game')
    }
    preload()
    {

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
        groundLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        })
        // pink? is the water collision
        waterLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(200, 100, 48, 255),
            faceColor: new Phaser.Display.Color(50, 60, 70, 255)
        })
        // green boxes are the static objects collision
        objectsLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(100, 200, 48, 255),
            faceColor: new Phaser.Display.Color(40, 30, 10, 255)
        })

        const man = this.add.sprite( 156, 128, 'man', 'man-walk-down-02.png')

        this.anims.create({
            key: 'man-idle-down',
            frames: [{key: 'man', frame: 'man-walk-down-02.png'}]
        })
        this.anims.create({
            key: 'man-walk-down',
            frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-down-0', suffix: '.png' }),
            repeat: -1,
            frameRate: 5
        })

        man.anims.play('man-walk-down')
    }
}
