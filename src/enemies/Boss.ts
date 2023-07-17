import Phaser from "phaser";
import { sceneEvents } from "../events/EventsCenter";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
  STOMP,
  SPIN
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

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private moveEvent: Phaser.Time.TimerEvent;
  private healthState = HealthState.IDLE
  private _health: number
  private damageTime = 0;
  private currentTarget:any = {x: 0, y:0,distance:Number(1000)}
  public isAlive:boolean = true
  public isStomp = false
  public enemyType = 'boss'

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this._health = 10;
    this.anims.play("boss-idle-down");
    
    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );
    

    this.moveEvent = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        const newNum = Math.random()
        if (newNum >= .4) {
          
          this.seekAndDestroy()
        } else if (newNum >= .3 && newNum < .4 ) {
          this.direction = 5
          this.direction = randomDirection(this.direction);  
           
        } else if (newNum >= .1 && newNum < .3 ) {
          this.currentTarget = {x: 0, y:0,distance:500}
          this.direction = 4
        } else {
          this.direction = 5
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
    let distance = Math.abs(this.x - host.x) + Math.abs(this.y - host.y)
    if(this.currentTarget.id === "host" || (distance < 1000 && distance< this.currentTarget.distance)) {
      this.currentTarget = {
        id:'host',
        x:host.x,
        y:host.y,
        distance:distance
      }
    }

    for (const entry of playerData.entries()) {
      distance = Math.abs(this.x - entry[1].x) + Math.abs(this.y - entry[1].y)
      if(this.currentTarget.id === entry[0]) {
        this.currentTarget = {
          id:entry[0],
          x:entry[1].x,
          y:entry[1].y,
          distance:distance
        }
      }
      if  (distance < 1000 && distance< this.currentTarget.distance) {
        this.currentTarget = {
          id:entry[0],
          x:entry[1].x,
          y:entry[1].y,
          distance:distance
        }
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

    const speed = 125;

    switch (this.direction) {
      case Direction.UP:
        this.anims.play("boss-walk-up", true);
        this.setVelocity(0, -speed);
        break;
      case Direction.DOWN:
        this.anims.play("boss-walk-down", true);
        this.setVelocity(0, speed);
        break;
      case Direction.LEFT:
        this.anims.play("boss-walk-left", true);
        this.setVelocity(-speed, 0);
        break;
      case Direction.RIGHT:
        this.anims.play("boss-walk-right", true);
        this.setVelocity(speed, 0);
        break;
      case Direction.STOMP:
        sceneEvents.emit("boss-stomp");
        this.anims.play("boss-stomp", true);
        this.setVelocity(0, 0);
        break;
      case Direction.SPIN:
        sceneEvents.emit("boss-spin");
        this.anims.play("boss-spin", true);
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

export { Boss };
