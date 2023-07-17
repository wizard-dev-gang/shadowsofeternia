import Phaser from "phaser"

export default class Credits extends Phaser.Scene{

    constructor(){
        super("endCredits")
    }

    create() {
        this.add.text(0, 0,
        `You did it!\n
        Thanks so much for playing Shadows of Eternia!\n
        We hope you enjoyed playing it as much\n
        as we did creating it!\n
        Made by:\n
        Sean Kutash, Robert Hess\n
        Dakota Jennings, Brenden Nieves\n
        Justin Sattur`, {
        fontSize: "11px",
        align: "left"
        // padding: {
        //     left: 42,
        //     right: 42,
        //     top: 42,
        //     bottom: 42,
        // },
        })
      }
    update(){

    }
}