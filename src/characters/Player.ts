import Phaser from "phaser";
import { Game } from "phaser";

export interface WASDKeys {
  W?: Phaser.Input.Keyboard.Key;
  A?: Phaser.Input.Keyboard.Key;
  S?: Phaser.Input.Keyboard.Key;
  D?: Phaser.Input.Keyboard.Key;
  Space?: Phaser.Input.Keyboard.Key;
}

export enum HealthState {
  IDLE,
  DAMAGE,
  DEAD,
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player(
        x: number,
        y: number,
        texture: string,
        frame?: string | number
      ): Player;
    }
  }
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  public healthState = HealthState.IDLE;
  private playerDeadSound?: Phaser.Sound.BaseSound;
  private damageTime = 0;
  public _health: number;
  public maxHealth: number;
  public exp: number = 0;
  public level: number = 1;
  // private knives?: Phaser.Physics.Arcade.Group;
  public projectiles?: Phaser.Physics.Arcade.Group;
  public lastProjectileTime?: number = 0;
  public projectileCooldown?: number = 1000; // cooldown in milliseconds
  public projectileLife?: number = 800; // projectile is removed after this amount of time
  public isDead: boolean = false;

  public keys: WASDKeys = {
    W: undefined,
    A: undefined,
    S: undefined,
    D: undefined,
  }; // Providing a default value to keys

  public lastMove = "down";
  public projectilesToSend?: any = {};
  public projectileCount = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.isDead = false;
    this._health = 10;
    this.maxHealth = 10;
    this.playerDeadSound = scene.sound.add("playerDeadSound");
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

  setProjectiles(projectiles: Phaser.Physics.Arcade.Group) {
    this.projectiles = projectiles;
  }

  increaseHealth(amount: number) {
    this._health += amount;

    // make sure the health doesnt exceed the max
    if (this._health > this.maxHealth) {
      this._health = this.maxHealth;
    }
  }

  handleDamage(dir: Phaser.Math.Vector2) {
    if (
      this.isDead ||
      this._health <= 0 ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }
    if (this.healthState === HealthState.DAMAGE) {
      return;
    }

    --this._health;

    if (this._health <= 0) {
      this.setVelocity(0, 0);
      this.isDead = true;
      this.playerDeadSound?.play();

      // Start the "death-ghost" animation
      this.play("death-ghost");
    } else {
      this.setVelocity(dir.x, dir.y);
      this.setTint(0xff0000);
      this.healthState = HealthState.DAMAGE;
      this.damageTime = 0;
    }
  }

  private throwProjectile(
    direction?: string,
    xLoc?: number,
    yLoc?: number,
    attackObj?: string,
    gameInstance?: Game
  ) {
    if (!this.projectiles) {
      return;
    }

    const currentTime = gameInstance
      ? gameInstance.time.now
      : this.scene.time.now;

    if (
      this.lastProjectileTime &&
      this.projectileCooldown &&
      currentTime < this.lastProjectileTime + this.projectileCooldown
    ) {
      return;
    }

    // update lastProjectileTime
    this.lastProjectileTime = currentTime;

    if (this.anims.currentAnim) {
      const parts = this.anims.currentAnim.key.split("-");
      direction = direction ? direction : parts[2];
      xLoc = xLoc ? xLoc : this.x;
      yLoc = yLoc ? yLoc : this.y;
      attackObj = attackObj ? attackObj : "knife";
    }

    const vec = new Phaser.Math.Vector2(0, 0);

    switch (direction) {
      case "up":
        vec.y = -1;
        break;
      case "down":
        vec.y = 1;
        break;
      case "left":
        vec.x = -1;
        break;
      default:
      case "right":
        vec.x = 1;
        break;
    }

    const angle = vec.angle();

    const projectile = this.projectiles.get(
      xLoc,
      yLoc,
      attackObj
    ) as Phaser.Physics.Arcade.Image;
    if (!projectile) {
      return;
    }
    projectile.setActive(true);
    projectile.setVisible(true);

    projectile.setRotation(angle);

    projectile.x += vec.x * 16;
    projectile.y += vec.y * 16;
    projectile.setVelocity(vec.x * 300, vec.y * 300);
    this.projectilesToSend[this.projectileCount] = {
      id: this.projectileCount,
      direction: direction,
      x: xLoc,
      y: yLoc,
      attackObj: attackObj,
    };
    this.projectileCount++;

    if (this.projectileLife) {
      this.scene.time.addEvent({
        delay: this.projectileLife,
        callback: () => {
          if (this.projectiles) {
            this.projectiles.remove(projectile, true, true); // Remove from group, and destroy the GameObject
          }
        },
        loop: false,
      });
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

  update() {
    //this.play(idle) takes in the idle variable which is the idle position of last move the player made
    //set player movement keys to WASD

    if (this.healthState === HealthState.DAMAGE) {
      return;
    } else if (this.isDead) {
      this.moveAsGhost();
      return;
    }

    if (this.keys.Space?.isDown) {
      this.throwProjectile();
      // if (this.activeChest)
      // {
      //     const coins = this.activeChest.open()
      //     this._coins += coins

      //     sceneEvents.emit('player-coins-changed', this._coins)
      // }
      // else
      // {
      //     this.throwKnife()
      // }
      // return
    }

    const speed = 150;
    if (this.keys.A?.isDown) {
      this.anims.play("man-walk-left", true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
    } else if (this.keys.D?.isDown) {
      this.anims.play("man-walk-right", true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
    } else if (this.keys.W?.isDown) {
      this.anims.play("man-walk-up", true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
    } else if (this.keys.S?.isDown) {
      this.anims.play("man-walk-down", true);
      this.setVelocity(0, speed);
      this.lastMove = "down";
    } else {
      const idle = `man-idle-${this.lastMove}`;
      this.play(idle);
      this.setVelocity(0, 0);
    }
  }

  moveAsGhost() {
    const speed = 200;
    if (this.keys.A?.isDown) {
      this.anims.play(this.anims.currentAnim, true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
    } else if (this.keys.D?.isDown) {
      this.anims.play(this.anims.currentAnim, true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
    } else if (this.keys.W?.isDown) {
      this.anims.play(this.anims.currentAnim, true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
    } else if (this.keys.S?.isDown) {
      this.anims.play(this.anims.currentAnim, true);
      this.setVelocity(0, speed);
      this.lastMove = "down";
    } else {
      this.setVelocity(0, 0);
    }

    if (this.isDead) {
      if (this.anims.currentAnim && this.anims.currentAnim.frames[1]) {
        this.anims.pause(this.anims.currentAnim.frames[1]);
      }
    } else {
      const idle = `archer-idle-${this.lastMove}`;
      this.play(idle);
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

    // Set the hitbox size
    const hitboxWidth = sprite.width * 0.42;
    const hitboxHeight = sprite.height * 0.42;
    sprite.body?.setSize(hitboxWidth, hitboxHeight);

    // Set the hitbox offset
    const offsetX = sprite.width / (10 / 3);
    const offsetY = sprite.height * 0.6;
    sprite.body?.setOffset(offsetX, offsetY);

    return sprite;
  }
);

export { Player };
