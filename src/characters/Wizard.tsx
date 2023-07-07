import Phaser from "phaser";
import Player from "./Player";

interface WASDKeys {
    W?: Phaser.Input.Keyboard.Key;
    A?: Phaser.Input.Keyboard.Key;
    S?: Phaser.Input.Keyboard.Key;
    D?: Phaser.Input.Keyboard.Key;
    Space?: Phaser.Input.Keyboard.Key;
  }

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
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

export default class Wizard extends Player{
  private healthState = HealthState.IDLE;
  private damageTime = 0;
  private _health: number;
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
        this._health = 10;
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
    
    getHealth() {
      return this._health;
    }

      handleDamage(dir: Phaser.Math.Vector2) {
    if (this._health <= 0) {
      return;
    }
    if (this.healthState === HealthState.DAMAGE) {
      return;
    }

    --this._health;

    if (this._health <= 0) {
      this.setVelocity(0, 0);
      this.healthState = HealthState.DEAD;
      this.play("wizard-walk-right");
    } else {
      this.setVelocity(dir.x, dir.y);

      this.setTint(0xff0000);

      this.healthState = HealthState.DAMAGE;
      this.damageTime = 0;
    }
  }

  preUpdate(t: number, dt: number): void {
    super.preUpdate(t, dt);

    switch (this.healthState) {
      case HealthState.IDLE:
        break;
      case HealthState.DAMAGE:
        this.damageTime += dt;
        if (this.damageTime >= 250) {
          this.healthState = HealthState.IDLE;
          this.setTint(0xffffff);
          this.damageTime = 0;
        }
    }
  }


    update(){
    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }

        const speed = 100;
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

    // Set the hitbox size
    const hitboxWidth = sprite.width * 0.42;
    const hitboxHeight = sprite.height * 0.42;
    sprite.body?.setSize(hitboxWidth, hitboxHeight);

    // Set the hitbox offset
    const offsetX = sprite.width / (10 / 3);
    const offsetY = sprite.height * 0.6;
    sprite.body?.setOffset(offsetX, offsetY);

    return sprite
 }
)

export { Wizard }