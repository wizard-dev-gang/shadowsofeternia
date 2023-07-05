

import Phaser from "phaser";

export default class ChooseCharacterScene extends Phaser.Scene {
    constructor() {
        super("chooseCharacter");
    }

    preload() {
        this.load.image("pixel-art-night-sky-background", "public/assets/pixel-art-night-sky-background.png");
        
        this.load.image('character1', 'public/assets/manAlone.png');
        this.load.image('character2', 'public/assets/manAlone.png');
        this.load.image('character3', 'public/assets/manAlone.png');
        this.load.image('character4', 'public/assets/manAlone.png');
    }

    create() {
        this.add.image(0, 0, 'pixel-art-night-sky-background').setOrigin(0, 0);

        this.add.text(this.sys.game.config.width / 2, 50, "Select a Character", { fontSize: '32px', align: 'center' }).setOrigin(0.5);
        
        const character1 = this.add.image(100, 200, 'character1').setScale(2).setInteractive({ useHandCursor: true });
        const character2 = this.add.image(200, 200, 'character2').setScale(2).setInteractive({ useHandCursor: true });
        const character3 = this.add.image(300, 200, 'character3').setScale(2).setInteractive({ useHandCursor: true });
        const character4 = this.add.image(400, 200, 'character4').setScale(2).setInteractive({ useHandCursor: true });

        this.add.text(100, 280, 'Character 1', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(200, 280, 'Character 2', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(300, 280, 'Character 3', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(400, 280, 'Character 4', { fontSize: '12px', align: 'center' }).setOrigin(0.5);

        character1.on('pointerdown', () => this.startGame());
        character2.on('pointerdown', () => this.startGame());
        character3.on('pointerdown', () => this.startGame());
        character4.on('pointerdown', () => this.startGame());
    }

    startGame() {
        this.scene.start('game');
    }
}


