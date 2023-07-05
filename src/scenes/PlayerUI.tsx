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
        const y = 75
        const x = 75
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








        // const healthBar = this.add.group({
        //     classType: Phaser.GameObjects.Image
        // })

        // healthBar.createMultiple({
        //     key: "healthBar-full",
        //     setXY: {
        //         x: 75,
        //         y: 10,
        //         stepX: 16,
        //     },
        //     quantity: 1,
        //     displayWidth: 1000
        // })
    }
}