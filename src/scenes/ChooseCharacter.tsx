
import Phaser from "phaser";
import { createCharacterAnims } from '../anims/CharacterAnims'; 

export default class ChooseCharacterScene extends Phaser.Scene {
    constructor() {
        super("chooseCharacter");
    }

    preload() {
        this.load.image("pixel-art-night-sky-background", "/assets/pixel-art-night-sky-background.png");
        
        this.load.spritesheet('character1', '/assets/manAlone.png', { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('barb', '/assets/barb.png', { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('character3', '/assets/manAlone.png', { frameWidth: 32, frameHeight: 32 }); 
        this.load.spritesheet('character4', '/assets/manAlone.png', { frameWidth: 32, frameHeight: 32 }); 

        this.load.bitmapFont('Joystix', '/assets/fonts/Joystix.png', '/assets/fonts/Joystix.fnt');
    }

    create() {
      // this.textures.setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.add.image(0, 0, 'pixel-art-night-sky-background').setOrigin(0, 0).setScale(0.8);

        this.add.text(this.sys.game.config.width / 2, 36, "Select a Character", { fontSize: '28px', fontFamily: 'Joystix', align: 'center' }).setOrigin(0.5);
        
        const character1 = this.add.sprite(80, 200, 'character1').setScale(2).setInteractive({ useHandCursor: true });
        const character2 = this.add.sprite(193.33, 200, 'barb').setScale(2).setInteractive({ useHandCursor: true });
        const character3 = this.add.sprite(306.66, 200, 'character3').setScale(2).setInteractive({ useHandCursor: true });
        const character4 = this.add.sprite(420, 200, 'character4').setScale(2).setInteractive({ useHandCursor: true });

        this.add.text(80, 280, 'Rogue', { fontSize: '10px', fontFamily: 'Joystix', align: 'center' }).setOrigin(0.5);
        this.add.text(193.33, 280, 'Barbarian', { fontSize: '10px', fontFamily: 'Joystix', align: 'center' }).setOrigin(0.5);
        this.add.text(306.66, 280, 'Character 3', { fontSize: '10px', fontFamily: 'Joystix', align: 'center' }).setOrigin(0.5);
        this.add.text(420, 280, 'Character 4', { fontSize: '10px', fontFamily: 'Joystix', align: 'center' }).setOrigin(0.5);

        createCharacterAnims(this.anims);
        
        //Created a slow walking animation for this scene
        this.anims.create({
          key: 'man-walk-down-slow',
          frames: this.anims.generateFrameNames('man', { start: 1, end: 3, prefix: 'man-walk-down-0', suffix: '.png' }),
          repeat: -1,
          frameRate: 10
      })

        this.anims.create({
            key: "barb-walk-down-slow",
            frames: this.anims.generateFrameNames("barb", {start: 1, end: 3, prefix: "barb-walk-down-0", suffix: ".png"}),
            repeat: -1,
            frameRate: 10
        })

        // Start animation on hover
        character1.on('pointerover', () => {character1.anims.play('man-walk-down-slow', true); });
        character1.on('pointerout', () => { character1.anims.stop(); });

        character2.on('pointerover', () => { character2.anims.play('barb-walk-down-slow', true); });
        character2.on('pointerout', () => { character2.anims.stop(); });

        character3.on('pointerover', () => { character3.anims.play('man-walk-down-slow', true); });
        character3.on('pointerout', () => { character3.anims.stop(); });

        character4.on('pointerover', () => { character4.anims.play('man-walk-down-slow', true); });
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


