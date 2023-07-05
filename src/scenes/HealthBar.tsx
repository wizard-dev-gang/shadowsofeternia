export default class healthBar{

    private scene: Phaser.Scene
    private x: number
    private y: number
    private width: number

    private leftCap?: Phaser.GameObjects.Image
    private middle?: Phaser.GameObjects.Image
    private rightCap?: Phaser.GameObjects.Image

    constructor(scene, x: number, y: number, width: number)
    {
        this.scene = scene
        this.x = x
        this.y = y
        this.width = width
    }
    withLeftCap(cap: Phaser.GameObjects.Image)
    {
        this.leftCap = cap.setOrigin(0, 0.5)
        return this
    }
    withMiddle(middle: Phaser.GameObjects.Image)
    {
        this.middle = middle.setOrigin(0, 0.5)
        return this
    }
    withRightCap(cap: Phaser.GameObjects.Image)
    {
        this.rightCap = cap.setOrigin(0, 0.5)
        return this
    }

    layout()
    {
        if(!this.leftCap || !this.middle || !this.rightCap)
        {
            return this
        }

        this.middle.displayWidth = this.width
        this.leftCap.x = this.x
        this.leftCap.y = this.y

        this.middle.x = this.leftCap.x + this.leftCap.width
        this.middle.y = this.leftCap.y

        this.rightCap.x = this.middle.x + this.middle.displayWidth
        this.rightCap.y = this.middle.y 

        return this
    }

    animateToFill(fill: number)
    {
        if(!this.middle)
        {
            return
        }

        const percent = Math.max(0, Math.min(1, fill))
    }

}