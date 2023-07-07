import Phaser from "phaser";

interface WASDKeys {
    W?: Phaser.Input.Keyboard.Key;
    A?: Phaser.Input.Keyboard.Key;
    S?: Phaser.Input.Keyboard.Key;
    D?: Phaser.Input.Keyboard.Key;
    Space?: Phaser.Input.Keyboard.Key;
  }

declare global {
    namespace Phaser.GameObjects{
      interface GameObjectsFactory{
        wizard(
          x: number,
          y: number,
          texture: string,
          frame?: string | number)
          : Wizard
        }
    }
}

export default class Wizard extends Phaser.Physics.Arcade.Sprite{

    private keys: WASDKeys = {
        W: undefined,
        A: undefined,
        S: undefined,
        D: undefined,
    }
    public lastMove = "down";

    constructor(scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        frame?: string | number
        ) {
        super(scene, x, y, texture, frame)
        if (this.scene && this.scene.input && this.scene.input.keyboard) {
            this.keys = this.scene.input.keyboard.addKeys({
              W: Phaser.Input.Keyboard.KeyCodes.W,
              A: Phaser.Input.Keyboard.KeyCodes.A,
              S: Phaser.Input.Keyboard.KeyCodes.S,
              D: Phaser.Input.Keyboard.KeyCodes.D,
              Space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            }) as WASDKeys;
          }
    }


    update(){
        const speed = 200;
    if (this.keys.A?.isDown) {
      this.anims.play("wizard-walk-left", true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
    } else if (this.keys.D?.isDown) {
      this.anims.play("wizard-walk-right", true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
    } else if (this.keys.W?.isDown) {
      this.anims.play("wizard-walk-up", true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
    } else if (this.keys.S?.isDown) {
      this.anims.play("wizard-walk-down", true);
      this.setVelocity(0, speed);
      this.lastMove = "down";
    } else {
      const idle = `wizard-idle-${this.lastMove}`;
      this.play(idle);
      this.setVelocity(0, 0);
    }
    }
}

Phaser.GameObjects.GameObjectFactory.register(
    "wizard", 
    function (
      this: Phaser.GameObjects.GameObjectFactory,
      x: number,
      y: number,
      texture: string,
      frame?: string | number
      ) {
    const sprite = new Wizard(this.scene, x, y, texture, frame)

    
    this.displayList.add(sprite);
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
      );

    return sprite
 }
)

export { Wizard }