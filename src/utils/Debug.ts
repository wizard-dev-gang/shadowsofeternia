import Phaser from "phaser";

const debugDraw = (layer: Phaser.Tilemaps.TilemapLayer, scene: Phaser.Scene) => {
    const debugGraphics = scene.add.graphics().setAlpha(0.7)
        layer.renderDebug(debugGraphics, {
            tileColor:null,
            collidingTileColor: new Phaser.Display.Color(243, 243, 48, 255),
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        })
    
    // const debugGraphics = scene.add.graphics().setAlpha(0.7)

    //     Yellow blocks are the ground collision boxes
    //     groundLayer.renderDebug(debugGraphics, {
    //         tileColor: null,
    //         collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //         faceColor: new Phaser.Display.Color(40, 39, 37, 255)
    //     })
    //      pink? is the water collision
    //     waterLayer.renderDebug(debugGraphics, {
    //         tileColor: null,
    //         collidingTileColor: new Phaser.Display.Color(200, 100, 48, 255),
    //         faceColor: new Phaser.Display.Color(50, 60, 70, 255)
    //     })
    //      green boxes are the static objects collision
    //     objectsLayer.renderDebug(debugGraphics, {
    //         tileColor: null,
    //         collidingTileColor: new Phaser.Display.Color(100, 200, 48, 255),
    //         faceColor: new Phaser.Display.Color(40, 30, 10, 255)
    //     })
}

export {
    debugDraw
}