import Phaser from "phaser";

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
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      barb(
        x: number,
        y: number,
        texture: string,
        frame?: string | number
      ): Barb;
    }
  }
}

export default class Barb extends Phaser.Physics.Arcade.Sprite {
  public healthState = HealthState.IDLE;
  private playerDeadSound?: Phaser.Sound.BaseSound;
  private damageTime = 0;
  public _health: number;
  public maxHealth: number;
  private projectiles?: Phaser.Physics.Arcade.Group;
  private lastThrowTime = 0;
  public exp: number = 0;
  public level: number = 1;
  public isDead: boolean = false;

  private keys: WASDKeys = {
    W: undefined,
    A: undefined,
    S: undefined,
    D: undefined,
  };

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
    this._health = 5;
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

  setHealth(health: number) {
    this._health = health;
  }

  setMaxHealth(maxHealth: number) {
    this.maxHealth = maxHealth;
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
    attackObj?: string
  ) {
    if (!this.projectiles) {
      return;
    }

    if (this.anims.currentAnim) {
      const parts = this.anims.currentAnim.key.split("-");

      direction = direction ? direction : parts[2];
      xLoc = xLoc ? xLoc : this.x;
      yLoc = yLoc ? yLoc : this.y;
      attackObj = attackObj ? attackObj : "slash";
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

    projectile.setData("initialX", projectile.x);
    projectile.setData("initialY", projectile.y);

    this.projectilesToSend[this.projectileCount] = {
      id: this.projectileCount,
      direction: direction,
      x: xLoc,
      y: yLoc,
      attackObj: attackObj,
    };
    this.projectileCount++;
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
    if (this.healthState === HealthState.DAMAGE) {
      return;
    } else if (this.isDead) {
      this.moveAsGhost();
      return;
    }

    const projectiles = this.projectiles?.getChildren();

    projectiles?.forEach((projectile: Phaser.GameObjects.GameObject) => {
      const projectileImage = projectile as Phaser.Physics.Arcade.Image;
      const initialX = projectileImage.getData("initialX");
      const initialY = projectileImage.getData("initialY");

      const distanceX = Math.abs(projectileImage.x - initialX);
      const distanceY = Math.abs(projectileImage.y - initialY);
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      const maxDistance = 16; //Sets max distance the projectile can travel
      if (distance >= maxDistance) {
        this.projectiles?.remove(projectileImage, true, true);
      }
    });

    const speed = 1050;
    let isMoving = false;

    if (this.keys.A?.isDown) {
      this.anims.play("barb-walk-left", true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
      isMoving = true;
    }
    if (this.keys.D?.isDown) {
      this.anims.play("barb-walk-right", true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
      isMoving = true;
    }
    if (this.keys.W?.isDown) {
      this.anims.play("barb-walk-up", true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
      isMoving = true;
    }
    if (this.keys.S?.isDown) {
      this.anims.play("barb-walk-down", true);
      this.setVelocity(0, speed);
      this.lastMove = "down";
      isMoving = true;
    }

    const now = Date.now();
    const timeSinceLastThrow = now - this.lastThrowTime;
    const throwCooldown = 1000; // Cooldown time to attack again

    if (this.keys.Space?.isDown && timeSinceLastThrow > throwCooldown) {
      const slash = `barb-attack-${this.lastMove}`;
      this.anims.play(slash, true);
      this.throwProjectile();
      this.lastThrowTime = now;
    }

    if (!isMoving) {
      const idle = `barb-idle-${this.lastMove}`;
      this.play(idle);
      this.setVelocity(0, 0);
    }
  }

  moveAsGhost() {
    const speed = 150;
    if (this.keys.A?.isDown) {
      this.anims.play(this.anims.currentAnim!, true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
    } else if (this.keys.D?.isDown) {
      this.anims.play(this.anims.currentAnim!, true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
    } else if (this.keys.W?.isDown) {
      this.anims.play(this.anims.currentAnim!, true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
    } else if (this.keys.S?.isDown) {
      this.anims.play(this.anims.currentAnim!, true);
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
  "barb",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const sprite = new Barb(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    // Set the hitbox size
    const hitboxWidth = sprite.width * 0.6;
    const hitboxHeight = sprite.height * 0.6;
    sprite.body?.setSize(hitboxWidth, hitboxHeight);

    // Set the hitbox offset
    const offsetX = 6;
    const offsetY = sprite.height * 0.42;
    sprite.body?.setOffset(offsetX, offsetY);

    return sprite;
  }
);

export { Barb };
