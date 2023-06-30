import React, { useEffect } from 'react';
import Phaser from 'phaser';
import Game from '../scenes/Game';
import Preloader from '../scenes/Preloader';

function GameComponent() {
    const phaserGameRef = React.useRef(null)

    useEffect(() => {
        if (phaserGameRef.current) {
            return;
        }
        phaserGameRef.current = new Phaser.Game({
            type: Phaser.AUTO,
            parent: 'game-content',
            width: 400,
            height: 250,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0},
                    debug:false
                },
            },
            scene: [Preloader, Game],
            scale: {
                zoom:2
            }
        });

    }, []);
        return <div id='game-content'></div>
}

export default GameComponent;