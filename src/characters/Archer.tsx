

// import Phaser from "phaser";
// import Player, { WASDKeys, HealthState } from "./Player";

// export default class Archer extends Player {
//   private keys: WASDKeys = {
//     W: undefined,
//     A: undefined,
//     S: undefined,
//     D: undefined,
//   };

//   constructor(
//     scene: Phaser.Scene,
//     x: number,
//     y: number,
//     texture: string,
//     frame?: string | number
//   ) {
//     super(scene, x, y, texture, frame);
//     if (this.scene && this.scene.input && this.scene.input.keyboard) {
//       this.keys = this.scene.input.keyboard.addKeys({
//         W: Phaser.Input.Keyboard.KeyCodes.W,
//         A: Phaser.Input.Keyboard.KeyCodes.A,
//         S: Phaser.Input.Keyboard.KeyCodes.S,
//         D: Phaser.Input.Keyboard.KeyCodes.D,
//         Space: Phaser.Input.Keyboard.KeyCodes.SPACE,
//       }) as WASDKeys;
//     }
//   }


//   private throwKnife(
//     direction?: string,
//     xLoc?: number,
//     yLoc?: number,
//     projectile?: string
//   ) {
//     if (!this.knives) {
//       return;
//     }

//     if (this.anims.currentAnim) {
//       const parts = this.anims.currentAnim.key.split("-");
//       direction = parts[2];
//       xLoc = this.x;
//       yLoc = this.y;
//       projectile = "arrow";
//     }

//     const vec = new Phaser.Math.Vector2(0, 0);

//     switch (direction) {
//       case "up":
//         vec.y = -1;
//         break;
//       case "down":
//         vec.y = 1;
//         break;
//       case "left":
//         vec.x = -1;
//         break;
//       default:
//       case "right":
//         vec.x = 1;
//         break;
//     }

//     const angle = vec.angle();

//     const knife = this.knives.get(
//       xLoc,
//       yLoc,
//       projectile
//     ) as Phaser.Physics.Arcade.Image;
//     if (!knife) {
//       return;
//     }
//     knife.setActive(true);
//     knife.setVisible(true);

//     knife.setRotation(angle);

//     knife.x += vec.x * 16;
//     knife.y += vec.y * 16;
//     knife.setVelocity(vec.x * 300, vec.y * 300);
//     console.log(knife.x, knife.y, direction);
//   }

//   update() {
//     if (
//       this.healthState === HealthState.DAMAGE ||
//       this.healthState === HealthState.DEAD
//     ) {
//       return;
//     }

//     if (this.keys.Space?.isDown) {
//         this.throwKnife();
//     }

//     const speed = 200;

//     if (this.keys.A?.isDown) {
//       this.anims.play("archer-walk-left", true);
//       this.setVelocity(-speed, 0);
//       this.lastMove = "left";
//     } else if (this.keys.D?.isDown) {
//       this.anims.play("archer-walk-right", true);
//       this.setVelocity(speed, 0);
//       this.lastMove = "right";
//     } else if (this.keys.W?.isDown) {
//       this.anims.play("archer-walk-up", true);
//       this.setVelocity(0, -speed);
//       this.lastMove = "up";
//     } else if (this.keys.S?.isDown) {
//       this.anims.play("archer-walk-down", true);
//       this.setVelocity(0, speed);
//       this.lastMove = "down";
//     } else {
//       const idle = `archer-idle-${this.lastMove}`;
//       this.play(idle);
//       this.setVelocity(0, 0);
//     }
//   }
// }

// Phaser.GameObjects.GameObjectFactory.register(
//   "archer",
//   function (
//     this: Phaser.GameObjects.GameObjectFactory,
//     x: number,
//     y: number,
//     texture: string,
//     frame?: string | number
//   ) {
//     const sprite = new Archer(this.scene, x, y, texture, frame);

//     this.displayList.add(sprite);
//     this.updateList.add(sprite);

//     this.scene.physics.world.enableBody(
//       sprite,
//       Phaser.Physics.Arcade.DYNAMIC_BODY
//     );

//     // Set the hitbox size
//     const hitboxWidth = sprite.width * 0.42;
//     const hitboxHeight = sprite.height * 0.42;
//     sprite.body?.setSize(hitboxWidth, hitboxHeight);

//     // Set the hitbox offset
//     const offsetX = sprite.width / (10 / 3);
//     const offsetY = sprite.height * 0.6;
//     sprite.body?.setOffset(offsetX, offsetY);

//     return sprite;
//   }
// );

// export { Archer };





import Phaser from "phaser";
import Player, { WASDKeys, HealthState } from "./Player";

export default class Archer extends Player {
  private keys: WASDKeys = {
    W: undefined,
    A: undefined,
    S: undefined,
    D: undefined,
  };

  private throwStartTime: number | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
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

  private throwKnife(
    direction?: string,
    xLoc?: number,
    yLoc?: number,
    projectile?: string
  ) {
    if (!this.knives) {
      return;
    }


    if (this.anims.currentAnim) {
      const parts = this.anims.currentAnim.key.split("-");
      direction = parts[2];
      xLoc = this.x;
      yLoc = this.y;
      projectile = "arrow";
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

    const knife = this.knives.get(
      xLoc,
      yLoc,
      projectile
    ) as Phaser.Physics.Arcade.Image;
    if (!knife) {
      return;
    }

    const hitboxWidth = knife.width * 0.42; 
    const hitboxHeight = knife.height * 0.30; 
    knife.body?.setSize(hitboxWidth, hitboxHeight);

    knife.setActive(true);
    knife.setVisible(true);

    knife.setRotation(angle);

    knife.x += vec.x * 16;
    knife.y += vec.y * 16;
    

    // Calculate the velocity based on the duration the space bar was held down
    const velocityMultiplier = 1 + (this.getThrowDuration() / 1000); // Increase velocity by 1 unit per second
    const velocityX = vec.x * 300 * velocityMultiplier;
    const velocityY = vec.y * 300 * velocityMultiplier;
    knife.setVelocity(velocityX, velocityY);
    console.log(knife.x, knife.y, direction);
  }

  private getThrowDuration() {
    if (this.throwStartTime !== null) {
      return Date.now() - this.throwStartTime;
    }
    return 0;
  }

  update() {
    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }

    if (this.keys.Space?.isDown && this.throwStartTime === null) {
      // Start tracking the throw start time
      this.throwStartTime = Date.now();
      //If space bar is released and start time is not null then allow player to throw arrow
    } else if (!this.keys.Space?.isDown && this.throwStartTime !== null) { 
      this.throwKnife();
      this.throwStartTime = null; //Resets start time to null so more arrows aren't thrown
    }

    const speed = 200;

    if (this.keys.A?.isDown) {
      this.anims.play("archer-walk-left", true);
      this.setVelocity(-speed, 0);
      this.lastMove = "left";
    } else if (this.keys.D?.isDown) {
      this.anims.play("archer-walk-right", true);
      this.setVelocity(speed, 0);
      this.lastMove = "right";
    } else if (this.keys.W?.isDown) {
      this.anims.play("archer-walk-up", true);
      this.setVelocity(0, -speed);
      this.lastMove = "up";
    } else if (this.keys.S?.isDown) {
      this.anims.play("archer-walk-down", true);
      this.setVelocity(0, speed);
      this.lastMove = "down";
    } else {
      const idle = `archer-idle-${this.lastMove}`;
      this.play(idle);
      this.setVelocity(0, 0);
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "archer",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    const sprite = new Archer(this.scene, x, y, texture, frame);

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

export { Archer };
