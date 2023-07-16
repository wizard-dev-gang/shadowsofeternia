import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const randomDirection = (exclude: Direction) => {
  let newDirection = Phaser.Math.Between(0, 3);
  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(0, 3);
  }
  return newDirection;
};

export default class Slime extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private moveEvent: Phaser.Time.TimerEvent;
  public isMoving = true;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    const hitboxWidth = 2; // Set the desired hitbox width
    const hitboxHeight = 2; // Set the desired hitbox height
    this.body?.setSize(hitboxWidth, hitboxHeight);

    this.anims.play("slime-right");

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.moveEvent = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        this.direction = randomDirection(this.direction);
      },
      loop: true,
    });
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

    if (!this.isMoving) {
      this.setVelocity(0, 0);
      return;
    }

    const speed = 50;

    switch (this.direction) {
      case Direction.UP:
        this.setVelocity(0, -speed);
        break;

      case Direction.DOWN:
        this.setVelocity(0, speed);
        break;

      case Direction.LEFT:
        this.setVelocity(-speed, 0);
        break;

      case Direction.RIGHT:
        this.setVelocity(speed, 0);
        break;
    }
  }
}

export { Slime };
