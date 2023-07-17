import Phaser from "phaser"

export default class Credits extends Phaser.Scene{

    constructor(){
        super("endCredits")
    }
    create() {

        const x = this.scale.width * 0.5
		const y = this.scale.height * 0.5

        const textie = `Thanks for playing Shadows Of Eternia! We hope you enjoyed playing as much as we did making it!\n
        This game was made as a way for us all to experience a little bit of fun and nostalgia in a modern way.\n
        The team behind the game:\n
        Sean Kutash, Robert Hess
        Dakota Jennings, Brenden Nieves,
        Justin Sattaur,
        We look forward to hearing all about your play-through, and who knows, maybe there is more coming in a future update\n
        :)`
        const arrayText = textie.split('\n')
        const text = this.add.text(0, 0, '', {
          fontSize: '28px',
          fontFamily: 'Arial',
        //   color: '#47BF31',
          wordWrap: { width: 400 },
          align: 'center',
          padding: 10,
        //   lineSpacing: 20
        });
    
        for (let i = 0; i < arrayText.length - 1; i++) {
          this.time.addEvent({
            delay: 4000 * i,
            callback: () => {
              text
                .setX(0)
                .setY(0)
                .setText(arrayText[i].trim())
            }
          })
        }
      }
    update(){}
}