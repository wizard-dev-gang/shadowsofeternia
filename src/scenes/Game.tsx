import Phaser from 'phaser';
import { createCharacterAnims } from '../anims/CharacterAnims'
import '../characters/Player'
import { debugDraw } from '../utils/Debug'

export default class Game extends Phaser.Scene
{
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private man!: Phaser.Physics.Arcade.Sprite
    constructor()
    {
        super('game')
    }
    preload()
    {   
        this.cursors = this.input.keyboard.createCursorKeys()

    }
    create()
    {
        createCharacterAnims(this.anims)

        const map = this.make.tilemap({key: 'testMap'})
        const tileset = map.addTilesetImage('spr_grass_tileset', 'tiles')
        
        // water layer goes in first to have it behind ground
        const waterLayer = map.createLayer('Water', tileset, 0, 0)
        const groundLayer = map.createLayer('Ground', tileset, 0, 0)
        const objectsLayer = map.createLayer('Static-Objects', tileset, 0,0)

        waterLayer.setCollisionByProperty({collides: true})
        groundLayer.setCollisionByProperty({collides: true})
        objectsLayer.setCollisionByProperty({collides: true})
        
        
        //debugDraw(groundLayer, this)

        this.man = this.add.player( 156, 128, 'man')

        this.physics.add.collider(this.man, waterLayer)
        this.physics.add.collider(this.man, groundLayer)
        this.physics.add.collider(this.man, objectsLayer)

        this.cameras.main.startFollow(this.man,)
    }
    update(t: number, dt: number)
    {
        if(this.man) 
		{
			this.man.update(this.cursors)
		}
        
    }
}
