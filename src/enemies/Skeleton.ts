import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
}

const randomDirection = (exclude: Direction) => {
  let newDirection = Phaser.Math.Between(0, 3);
  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(0, 3);
  }

  return newDirection;
};

export default class Skeleton extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private moveEvent: Phaser.Time.TimerEvent;
  private healthState = HealthState.IDLE
  private _health: number
  private damageTime = 0;
  public isAlive:boolean = true

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this._health = 3;
    this.anims.play("enemy-idle-down");

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );
    

    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.direction = randomDirection(this.direction);
      },
      loop: true,
    });
  }
  // Enemies have health, to not die in 1 hit.
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
      this.anims.play("death-ghost");
    } else {
      this.setVelocity(dir.x, dir.y);

      this.setTint(0xff0000);

      this.healthState = HealthState.DAMAGE;
      this.damageTime = 0;
    }
  }

  destroy(fromScene?: boolean) {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  private handleTileCollision(go: Phaser.GameObjects.GameObject) {
    if (go !== this) {
      return;
    }

    this.direction = randomDirection(this.direction);
  }

  preUpdate(t: number, dt: number) {
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

    const speed = 50;

    switch (this.direction) {
      case Direction.UP:
        this.anims.play("enemy-walk-up", true);
        this.setVelocity(0, -speed);
        break;
      case Direction.DOWN:
        this.anims.play("enemy-walk-down", true);
        this.setVelocity(0, speed);
        break;
      case Direction.LEFT:
        this.anims.play("enemy-walk-left", true);
        this.setVelocity(-speed, 0);
        break;
      case Direction.RIGHT:
        this.anims.play("enemy-walk-right", true);
        this.setVelocity(speed, 0);
    }
  }

  update(){
    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }
  }
}

export { Skeleton };
