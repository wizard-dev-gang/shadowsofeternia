import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  STOP,
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
  private healthState = HealthState.IDLE;
  private _health: number;
  private damageTime = 0;
  private currentTarget: any = { x: 0, y: 0, distance: Number(500) };
  public isAlive: boolean = true;
  private deathSound: Phaser.Sound.BaseSound;

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
    this.deathSound = scene.sound.add("skeleDeath");

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.moveEvent = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        let newNum = Math.random();
        if (newNum >= 0.3) {
          this.seekAndDestroy();
        } else if (newNum >= 0.1 && newNum < 0.2) {
          this.direction = randomDirection(this.direction);
        } else {
          this.currentTarget = { x: 0, y: 0, distance: Number(500) };
        }
      },
      loop: true,
    });
  }

  preload() {
    this.load.audio("skeleDeath", "/music/skeleDeath.mp3");
  }

  // Enemies have health, to not die in 1 hit.
  getHealth() {
    return this._health;
  }

  findTarget(playerData: Map<any, any>, host: any) {
    let distance = Math.abs(this.x - host.x) + Math.abs(this.y - host.y);
    if (
      this.currentTarget.id === "host" ||
      (distance < 500 && distance < this.currentTarget.distance)
    ) {
      this.currentTarget = {
        id: "host",
        x: host.x,
        y: host.y,
        distance: distance,
      };
    }

    for (const entry of playerData.entries()) {
      distance = Math.abs(this.x - entry[1].x) + Math.abs(this.y - entry[1].y);
      if (this.currentTarget.id === entry[0]) {
        this.currentTarget = {
          id: entry[0],
          x: entry[1].x,
          y: entry[1].y,
          distance: distance,
        };
      }
      if (distance < 500 && distance < this.currentTarget.distance) {
        this.currentTarget = {
          id: entry[0],
          x: entry[1].x,
          y: entry[1].y,
          distance: distance,
        };
      }
    }
  }

  seekAndDestroy() {
    if (
      Math.abs(this.x - this.currentTarget.x) >
      Math.abs(this.y - this.currentTarget.y)
    ) {
      this.x > this.currentTarget.x
        ? (this.direction = 2)
        : (this.direction = 3);
    } else {
      this.y > this.currentTarget.y
        ? (this.direction = 0)
        : (this.direction = 1);
    }
  }

  handleDamage() {
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
      this.deathSound.play();
    } else {

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

    const speed = 75;

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

  update() {
    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }
  }
}

export { Skeleton };
