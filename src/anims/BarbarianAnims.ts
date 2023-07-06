import Phaser from "phaser"; 

const createBarbarianAnims = (anims: Phaser.Animations.AnimationManager) => {

    // Idle animations
    anims.create({
        key: 'barb-idle-down',
        frames: [{key: 'barb', frame: 'barb-walk-down-02.png'}]
    })

    anims.create({
        key: 'barb-idle-up',
        frames: [{key: 'barb', frame: 'barb-walk-up-02.png'}]
    })

    anims.create({
        key: 'barb-idle-left',
        frames: [{key: 'barb', frame: 'barb-walk-left-02.png'}]
    })

    anims.create({
        key: 'barb-idle-right',
        frames: [{key: 'barb', frame: 'barb-walk-right-02.png'}]
    })


    // Walking animations
    anims.create({
        key: 'barb-walk-down',
        frames: anims.generateFrameNames('barb', { start: 1, end: 3, prefix: 'barb-walk-down-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'barb-walk-left',
        frames: anims.generateFrameNames('barb', { start: 1, end: 3, prefix: 'barb-walk-left-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'barb-walk-right',
        frames: anims.generateFrameNames('barb', { start: 1, end: 3, prefix: 'barb-walk-right-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

    anims.create({
        key: 'barb-walk-up',
        frames: anims.generateFrameNames('barb', { start: 1, end: 3, prefix: 'barb-walk-up-0', suffix: '.png' }),
        repeat: -1,
        frameRate: 20
    })

}

export {
    createBarbarianAnims
}