import Phaser from "phaser";

class Resurrect extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.anims.play("Resurrect");
  }

  destroy(fromScene?: boolean) {
    super.destroy(fromScene);
  }
}

export { Resurrect };
