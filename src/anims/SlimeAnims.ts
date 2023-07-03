import Phaser from "phaser";

const createSlimeAnims = (anims: Phaser.Animations.AnimationManager) => {

    anims.create({
        key: 'idle',
        frames: [{key: 'slime', frame: 'idle.png'}]
    })

    anims.create({
        key: 'slime-walk-down',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-walk-down-001', suffix: '.png'})
    })
    anims.create({
        key: 'slime-walk-up',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-walk-up-001', suffix: '.png'})
    })
    anims.create({
        key: 'slime-right',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-right-001', suffix: '.png'})
    })
    anims.create({
        key: 'slime-left',
        frames: anims.generateFrameNames('slime', {start: 1, end: 5, prefix: 'slime-left-001', suffix: '.png'})
    })
}

export {
    createSlimeAnims
}