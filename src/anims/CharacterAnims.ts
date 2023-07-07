import Phaser from "phaser";

const createCharacterAnims = (anims: Phaser.Animations.AnimationManager) => {
  // Idle animations
  anims.create({
    key: "man-idle-down",
    frames: [{ key: "man", frame: "man-walk-down-02.png" }],
  });

  anims.create({
    key: "man-idle-up",
    frames: [{ key: "man", frame: "man-walk-up-02.png" }],
  });

  anims.create({
    key: "man-idle-left",
    frames: [{ key: "man", frame: "man-walk-left-02.png" }],
  });

  anims.create({
    key: "man-idle-right",
    frames: [{ key: "man", frame: "man-walk-right-02.png" }],
  });

  // Walking animations
  anims.create({
    key: "man-walk-down",
    frames: anims.generateFrameNames("man", {
      start: 1,
      end: 3,
      prefix: "man-walk-down-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "man-walk-left",
    frames: anims.generateFrameNames("man", {
      start: 1,
      end: 3,
      prefix: "man-walk-left-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "man-walk-right",
    frames: anims.generateFrameNames("man", {
      start: 1,
      end: 3,
      prefix: "man-walk-right-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "man-walk-up",
    frames: anims.generateFrameNames("man", {
      start: 1,
      end: 3,
      prefix: "man-walk-up-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });


// Barbarian anims
  anims.create({
    key: "barb-idle-down",
    frames: [{ key: "barb", frame: "barb-walk-down-02.png" }],
  });

  anims.create({
    key: "barb-idle-up",
    frames: [{ key: "barb", frame: "barb-walk-up-02.png" }],
  });

  anims.create({
    key: "barb-idle-left",
    frames: [{ key: "barb", frame: "barb-walk-left-02.png" }],
  });

  anims.create({
    key: "barb-idle-right",
    frames: [{ key: "barb", frame: "barb-walk-right-02.png" }],
  });

  anims.create({
    key: "barb-walk-down",
    frames: anims.generateFrameNames("barb", {
      start: 1,
      end: 3,
      prefix: "barb-walk-down-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "barb-walk-left",
    frames: anims.generateFrameNames("barb", {
      start: 1,
      end: 3,
      prefix: "barb-walk-left-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "barb-walk-right",
    frames: anims.generateFrameNames("barb", {
      start: 1,
      end: 3,
      prefix: "barb-walk-right-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "barb-walk-up",
    frames: anims.generateFrameNames("barb", {
      start: 1,
      end: 3,
      prefix: "barb-walk-up-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

//   Archer anims
  // Idle animations
  anims.create({
    key: "archer-idle-down",
    frames: [{ key: "archer", frame: "archer-walk-down-02.png" }],
  });

  anims.create({
    key: "archer-idle-up",
    frames: [{ key: "archer", frame: "archer-walk-up-02.png" }],
  });

  anims.create({
    key: "archer-idle-left",
    frames: [{ key: "archer", frame: "archer-walk-left-02.png" }],
  });

  anims.create({
    key: "archer-idle-right",
    frames: [{ key: "archer", frame: "archer-walk-right-02.png" }],
  });


  anims.create({
    key: "archer-walk-down",
    frames: anims.generateFrameNames("archer", {
      start: 1,
      end: 4,
      prefix: "archer-walk-down-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "archer-walk-left",
    frames: anims.generateFrameNames("archer", {
      start: 1,
      end: 4,
      prefix: "archer-walk-left-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "archer-walk-right",
    frames: anims.generateFrameNames("archer", {
      start: 1,
      end: 4,
      prefix: "archer-walk-right-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });

  anims.create({
    key: "archer-walk-up",
    frames: anims.generateFrameNames("archer", {
      start: 1,
      end: 4,
      prefix: "archer-walk-up-0",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 7,
  });
};

export { createCharacterAnims };
