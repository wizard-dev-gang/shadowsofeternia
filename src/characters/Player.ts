import Phaser from "phaser";

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.IDLE;
  private damageTime = 0;

  private _health = 3;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    //this.man.anims.play('man-walk-up')
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
      this.play("man-walk-right");
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

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!cursors || !this) {
      return;
    }

    const speed = 200;
    if (cursors.left?.isDown) {
      this.anims.play("man-walk-left", true);
      this.setVelocity(-speed, 0);
    } else if (cursors.right?.isDown) {
      this.anims.play("man-walk-right", true);
      this.setVelocity(speed, 0);
    } else if (cursors.up?.isDown) {
      this.anims.play("man-walk-up", true);
      this.setVelocity(0, -speed);
    } else if (cursors.down?.isDown) {
      this.anims.play("man-walk-down", true);
      this.setVelocity(0, speed);
    } else {
      this.play("man-idle-down");
      this.setVelocity(0, 0);
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "player",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const sprite = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    sprite.body?.setSize(sprite.width * 0.8);

    return sprite;
  }
);
