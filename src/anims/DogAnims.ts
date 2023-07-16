import Phaser from "phaser";

export const createDogAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "Dog-idle-down",
    frames: [{ key: "Dog", frame: "Dog-walk-down-001.png" }],
  });
  anims.create({
    key: "Dog-idle-up",
    frames: [{ key: "Dog", frame: "Dog-walk-up-001.png" }],
  });
  anims.create({
    key: "Dog-idle-left",
    frames: [{ key: "Dog", frame: "Dog-walk-left-001.png" }],
  });
  anims.create({
    key: "Dog-idle-right",
    frames: [{ key: "Dog", frame: "Dog-walk-right-001.png" }],
  });

  anims.create({
    key: "Dog-walk-down",
    frames: anims.generateFrameNames("Dog", {
      start: 1,
      end: 3,
      prefix: "Dog-walk-down-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 9,
  });

  anims.create({
    key: "Dog-walk-up",
    frames: anims.generateFrameNames("Dog", {
      start: 1,
      end: 3,
      prefix: "Dog-walk-up-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 9,
  });

  anims.create({
    key: "Dog-walk-left",
    frames: anims.generateFrameNames("Dog", {
      start: 1,
      end: 3,
      prefix: "Dog-walk-left-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 9,
  });
  anims.create({
    key: "Dog-walk-right",
    frames: anims.generateFrameNames("Dog", {
      start: 1,
      end: 3,
      prefix: "Dog-walk-right-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 9,
  });
}