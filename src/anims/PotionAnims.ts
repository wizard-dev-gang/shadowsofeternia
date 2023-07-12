import Phaser from "phaser";

const createPotionAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "Potion",
    frames: anims.generateFrameNames("Potion", {
      prefix: "Potion-00",
      start: 1,
      end: 8,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
};

export { createPotionAnims };
