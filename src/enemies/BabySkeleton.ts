import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  STOP
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

export default class BabySkeleton extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private moveEvent: Phaser.Time.TimerEvent;
  private healthState = HealthState.IDLE
  private _health: number
  private damageTime = 0;
  private currentTarget:any = {x: 0, y:0,distance:Number(1000)}
  public isAlive:boolean = true

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this._health = 1;
    this.anims.play("enemy-idle-down");

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
          
        } else if (newNum >= .1 && newNum < .3 ) {
          this.direction = randomDirection(this.direction);
          
        } else {
          this.currentTarget = {x: 0, y:0,distance:Number(1000)}
          
        }
      },
      loop: true,
    });
  }
  // Enemies have health, to not die in 1 hit.
  getHealth() {
    return this._health;
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
      this.isAlive = false
      this.direction = 4
      this.setTint(0xffffff);
      this.anims.play("baby-skeleton-death", true);
      this.scene.time.delayedCall(1000, () => {
          this.destroy(true);
        })
      this.healthState = HealthState.DEAD;
    } else {
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

    const speed = 120;
    switch (this.direction) {
      case Direction.UP:
        this.anims.play("baby-skeleton-walk-up", true);
        this.setVelocity(0, -speed);
        break;
      case Direction.DOWN:
        this.anims.play("baby-skeleton-walk-down", true);
        this.setVelocity(0, speed);
        break;
      case Direction.LEFT:
        this.anims.play("baby-skeleton-walk-left", true);
        this.setVelocity(-speed, 0);
        break;
      case Direction.RIGHT:
        this.anims.play("baby-skeleton-walk-right", true);
        this.setVelocity(speed, 0);
        break;
      case Direction.STOP:
        this.setTint(0xffffff);
        this.anims.play("baby-skeleton-death", true);
        this.setVelocity(0, 0);
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

export { BabySkeleton };
