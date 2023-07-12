import Phaser from "phaser";

class Potion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
      super(scene, x, y, texture, frame);
      scene.add.existing(this);
      this.anims.play("Potion")
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
      }
  }

export { Potion }