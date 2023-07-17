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
  private currentTarget:any = {x: 0, y:0,distance:Number(1000)};
  public isAlive:boolean = true;
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
        let newNum = Math.random()
        if (newNum >= .3 && this.isAlive) {
          this.seekAndDestroy()
          
        } else if (newNum >= 0 && newNum < .3 ) {
          this.direction = randomDirection(this.direction);
          this.currentTarget = {x: 0, y:0,distance:Number(1000)}
          
        }
      },
      loop: true,
    });
  }

  findTarget(playerData:Map<any,any>, host:any) {
    let avoidTheDead = host.isDead? 2000 : 0
    let distance = Math.abs(this.x - host.x) + Math.abs(this.y - host.y) + avoidTheDead;
    if (
      this.currentTarget.id === "host" ||
      (distance < 1000 && distance < this.currentTarget.distance)
    ) {
      this.currentTarget = {
        id: "host",
        x: host.x,
        y: host.y,
        distance: distance,
      };
    }

    for (const entry of playerData.entries()) {
      avoidTheDead = entry[1].isDead? 2000 : 0
      distance = Math.abs(this.x - entry[1].x) + Math.abs(this.y - entry[1].y)+ avoidTheDead;
      if (this.currentTarget.id === entry[0]) {
        this.currentTarget = {
          id: entry[0],
          x: entry[1].x,
          y: entry[1].y,
          distance: distance,
        };
      }
      if (distance < 1000 && distance < this.currentTarget.distance) {
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
    
    if(Math.abs(this.x - this.currentTarget.x) > Math.abs(this.y - this.currentTarget.y)){
      this.x > this.currentTarget.x ? this.direction = 2 : this.direction = 3 
    }
    else 
    {
      this.y > this.currentTarget.y ? this.direction = 0 : this.direction = 1
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
