import Phaser from "phaser";

const createNpcAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: "Npc_wizard-idle",
    frames: anims.generateFrameNames("npcWizard", {
      prefix: "Npc_wizard-idle-00",
      start: 1,
      end: 4,
      suffix: ".png",
    }),
    frameRate: 8,
    repeat: -1,
  });
};

export { createNpcAnims };
