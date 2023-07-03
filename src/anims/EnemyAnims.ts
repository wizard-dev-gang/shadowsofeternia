import Phaser from "phaser"; 

const createEnemyAnims = (anims: Phaser.Animations.AnimationManager) => {
    anims.create({
        key: 'enemy-idle-down',
        frames: [{key:'jacked-skeleton', frame: 'enemy-walk-down-01.png'}]
    })

    anims.create({
        key:'enemy-walk-down',
        frames: anims.generateFrameNames('jacked-skeleton',{ start:1, end:3, prefix: 'enemy-walk-down-0', suffix:'.png' }),
        repeat:-1,
        frameRate:7
    })

    anims.create({
        key:'enemy-walk-up',
        frames: anims.generateFrameNames('jacked-skeleton',{ start:1, end:3, prefix: 'enemy-walk-up-0', suffix:'.png' }),
        repeat:-1,
        frameRate:7
    })

    anims.create({
        key:'enemy-walk-left',
        frames: anims.generateFrameNames('jacked-skeleton',{ start:1, end:3, prefix: 'enemy-walk-left-0', suffix:'.png' }),
        repeat:-1,
        frameRate:7
    })
    anims.create({
        key:'enemy-walk-right',
        frames: anims.generateFrameNames('jacked-skeleton',{ start:1, end:3, prefix: 'enemy-walk-right-0', suffix:'.png' }),
        repeat:-1,
        frameRate:7
    })
}

export {
    createEnemyAnims
}