import Phaser from "phaser";

export const createEnemyAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "enemy-idle-down",
    frames: [{ key: "jacked-skeleton", frame: "enemy-walk-down-01.png" }],
  });

  anims.create({
    key: "enemy-walk-down",
    frames: anims.generateFrameNames("jacked-skeleton", {
      start: 1,
      end: 3,
      prefix: "enemy-walk-down-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "enemy-walk-up",
    frames: anims.generateFrameNames("jacked-skeleton", {
      start: 1,
      end: 3,
      prefix: "enemy-walk-up-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "enemy-walk-left",
    frames: anims.generateFrameNames("jacked-skeleton", {
      start: 1,
      end: 3,
      prefix: "enemy-walk-left-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });
  anims.create({
    key: "enemy-walk-right",
    frames: anims.generateFrameNames("jacked-skeleton", {
      start: 1,
      end: 3,
      prefix: "enemy-walk-right-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  // Slime animations
  anims.create({
    key: "idle",
    frames: [{ key: "slime", frame: "idle.png" }],
  });

  anims.create({
    key: "slime-walk-down",
    frames: anims.generateFrameNames("slime", {
      start: 1,
      end: 5,
      prefix: "slime-walk-down-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });
  anims.create({
    key: "slime-walk-up",
    frames: anims.generateFrameNames("slime", {
      start: 1,
      end: 5,
      prefix: "slime-walk-up-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });
  anims.create({
    key: "slime-right",
    frames: anims.generateFrameNames("slime", {
      start: 1,
      end: 5,
      prefix: "slime-right-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });
  anims.create({
    key: "slime-left",
    frames: anims.generateFrameNames("slime", {
      start: 1,
      end: 5,
      prefix: "slime-left-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });
  anims.create({
    key: "slime-death",
    frames: anims.generateFrameNames("slime", {
      start: 1,
      end: 6,
      prefix: "slime-death-00",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 6,
  });
};
