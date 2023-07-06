


import Phaser from "phaser";
import { createCharacterAnims } from '../anims/CharacterAnims'; 

export default class ChooseCharacterScene extends Phaser.Scene {
    constructor() {
        super("chooseCharacter");
    }

    preload() {
        this.load.image("pixel-art-night-sky-background", "public/assets/pixel-art-night-sky-background.png");
        
        this.load.spritesheet('character1', 'public/assets/manAlone.png', { frameWidth: 32, frameHeight: 48 }); 
        this.load.spritesheet('character2', 'public/assets/manAlone.png', { frameWidth: 32, frameHeight: 48 }); 
        this.load.spritesheet('character3', 'public/assets/manAlone.png', { frameWidth: 32, frameHeight: 48 }); 
        this.load.spritesheet('character4', 'public/assets/manAlone.png', { frameWidth: 32, frameHeight: 48 }); 
    }

    create() {
        this.add.image(0, 0, 'pixel-art-night-sky-background').setOrigin(0, 0);

        this.add.text(this.sys.game.config.width / 2, 50, "Select a Character", { fontSize: '32px', align: 'center' }).setOrigin(0.5);
        
        const character1 = this.add.sprite(100, 200, 'character1').setScale(2).setInteractive({ useHandCursor: true });
        const character2 = this.add.sprite(200, 200, 'character2').setScale(2).setInteractive({ useHandCursor: true });
        const character3 = this.add.sprite(300, 200, 'character3').setScale(2).setInteractive({ useHandCursor: true });
        const character4 = this.add.sprite(400, 200, 'character4').setScale(2).setInteractive({ useHandCursor: true });

        this.add.text(100, 280, 'Character 1', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(200, 280, 'Character 2', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(300, 280, 'Character 3', { fontSize: '12px', align: 'center' }).setOrigin(0.5);
        this.add.text(400, 280, 'Character 4', { fontSize: '12px', align: 'center' }).setOrigin(0.5);

        // Create character animations
        createCharacterAnims(this.anims);

        // Start animation on hover
        character1.on('pointerover', () => { character1.anims.play('man-walk-down', true); });
        character1.on('pointerout', () => { character1.anims.stop(); });

        character2.on('pointerover', () => { character2.anims.play('man-walk-down', true); });
        character2.on('pointerout', () => { character2.anims.stop(); });

        character3.on('pointerover', () => { character3.anims.play('man-walk-down', true); });
        character3.on('pointerout', () => { character3.anims.stop(); });

        character4.on('pointerover', () => { character4.anims.play('man-walk-down', true); });
        character4.on('pointerout', () => { character4.anims.stop(); });
        

        character1.on('pointerdown', () => this.startGame());
        character2.on('pointerdown', () => this.startGame());
        character3.on('pointerdown', () => this.startGame());
        character4.on('pointerdown', () => this.startGame());
    }

    startGame() {
        this.scene.start('game');
    }
}



