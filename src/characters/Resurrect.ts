import Phaser from "phaser";
import Player from "./Player";
import Archer from "./Archer";
import Barb from "./Barb";
import Wizard from "./Wizard";

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
