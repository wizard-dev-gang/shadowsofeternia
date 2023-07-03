declare module "phaser" {
  interface GameObjectFactory {
    player(
      x: number,
      y: number,
      texture: string,
      frame?: string | number
    ): Player;
  }
}
