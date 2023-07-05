import Phaser from "phaser"
import HealthBar from "./HealthBar"

export default class PlayerUI extends Phaser.Scene
{
    constructor()
    {
        super({ key:'player-ui' })
    }
    create()
    {
        const y = 380
        const x = 50
        const fullWidth = 100

        this.add.text(x, y - 25, "Health", {
            fontSize: "10px",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 5,
        })
        const bar = new HealthBar(this, x, y, fullWidth)
            .withLeftCap(this.add.image(0, 0, 'healthBar-left-cap'))
            .withMiddle(this.add.image(0, 0, 'healthBar-middle'))
            .withRightCap(this.add.image(0, 0, 'healthBar-right-cap'))

            .layout()
            // is used to animate the bar going to 50%
            // .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {*insert bar.animateToFill})
           bar.animateToFill(0.5)

    }
}