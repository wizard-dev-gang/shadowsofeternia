import Phaser from "phaser";

export default class Slime extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    // Set up physics properties
    scene.physics.world.enable(this);
    if (this.body) {
      this.body.setSize(this.width * 0.8);
    }

    // Add the slime to the scene
    scene.add.existing(this);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    // Generate a random direction for movement
    const randomDirection = Math.floor(Math.random() * 4); // 0: up, 1: down, 2: left, 3: right
  
    // Set the velocity based on the random direction
    const speed = 100; // Adjust the speed as desired
    if (randomDirection === 0) {
      this.setVelocity(0, -speed); // Up
    } else if (randomDirection === 1) {
      this.setVelocity(0, speed); // Down
    } else if (randomDirection === 2) {
      this.setVelocity(-speed, 0); // Left
    } else if (randomDirection === 3) {
      this.setVelocity(speed, 0); // Right
    }
  
    // Stop moving if the slime reaches an edge of the screen
    if (
      this.x < 0 ||
      this.x = this.scene.game.config.width ||
      this.y < 0 ||
      this.y = this.scene.game.config.height
    ) {
      this.setVelocity(0, 0);
    }
  }
}

export { Slime };
