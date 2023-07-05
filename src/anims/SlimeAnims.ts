import Phaser from "phaser";

const createSlimeAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: 'idle',
        frames: [{key: 'slime', frame: 'idle.png'}]
    })

    anims.create({
        key: 'slime-walk-down',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-walk-down-00', suffix: '.png'}),
        repeat: -1,
        frameRate: 10
    })
    anims.create({
        key: 'slime-walk-up',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-walk-up-00', suffix: '.png'}),
        repeat: -1,
        frameRate: 10
    })
    anims.create({
        key: 'slime-right',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-right-00', suffix: '.png'}),
        repeat: -1,
        frameRate: 10
    })
    anims.create({
        key: 'slime-left',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-left-00', suffix: '.png'}),
        repeat: -1,
        frameRate: 10
    })
}

export {
    createSlimeAnims
}