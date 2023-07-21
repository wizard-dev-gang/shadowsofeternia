import Phaser from "phaser";

export default class Credits extends Phaser.Scene {
  constructor() {
    super("endCredits");
  }

  create() {
    const textie = `Thanks for playing \n Shadows Of Eternia! \n We hope you enjoyed playing as much as we did making it!\n
      This game was made as a way for us all to experience a little bit of fun and nostalgia in a modern way.\n
      The team behind the game:\n
      Sean Kutash,\nRobert Hess,\nDakota Jennings,\nBrenden Nieves,\nJustin Sattaur,\n
      We look forward to hearing all about your play-through, and who knows, maybe there is more coming in a future update\n
      :)`;
    const arrayText = textie.split("\n");
    let creditsText = "";
    for (let i = 0; i < arrayText.length - 1; i++) {
      creditsText += arrayText[i].trim() + "\n";
    }

    const text = this.add.text(0, this.cameras.main.height, creditsText, {
      fontSize: "20px",
      fontFamily: "Arial",
      // color: '#47BF31',
      wordWrap: { width: 300 },
      align: "center",
    });

    // Set initial position of the text with an additional 100 pixels to the right
    text.setPosition(55, 200);

    // Calculate the target position for scrolling
    const targetY = -text.height;

    // Create a tween to scroll the text
    this.tweens.add({
      targets: text,
      y: targetY,
      duration: 20000, // Change this value to control the speed of the scroll
      ease: "Linear",
    });
  }
}
