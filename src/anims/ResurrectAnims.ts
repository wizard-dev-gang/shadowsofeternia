import Phaser from "phaser";

const createResurrectAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "Resurrect",
    frames: anims.generateFrameNames("Resurrect", {
      prefix: "Resurrect-00",
      start: 1,
      end: 8,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
};

export { createResurrectAnims };
