import Phaser from "phaser"; 

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {

    // Idle animations
    anims.create({
        key: 'man-idle-down',
        frames: [{key: 'man', frame: 'man-walk-down-02.png'}]
    })

    anims.create({
        key: 'man-idle-up',
        frames: [{key: 'man', frame: 'man-walk-up-02.png'}]
    })

    anims.create({
        key: 'man-idle-left',
        frames: [{key: 'man', frame: 'man-walk-left-02.png'}]
    })

    anims.create({
        key: 'man-idle-right',
        frames: [{key: 'man', frame: 'man-walk-right-02.png'}]
    })


    // Walking animations
    anims.create({
        key: 'man-walk-down',
        frames: anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-down-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'man-walk-left',
        frames: anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-left-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'man-walk-right',
        frames: anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-right-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'man-walk-up',
        frames: anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-up-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

}

export {
    createCharacterAnims
}