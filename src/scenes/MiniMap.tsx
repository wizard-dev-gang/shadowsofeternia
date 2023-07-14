import Phaser from "phaser";

export default class MiniMapScene extends Phaser.Scene {
  constructor() {
    super("mini-map");
  }

  create() {
    const map = this.make.tilemap({ key: "townMapV2" });
    const tileset = map.addTilesetImage("Grasslands-Terrain", "terrain");
    const miniMapLayer = map.createLayer("Ground", tileset);

    const miniMapWidth = miniMapLayer.width * miniMapLayer.tileWidth;
    const miniMapHeight = miniMapLayer.height * miniMapLayer.tileHeight;
    const miniMapCamera = this.cameras.main;
    miniMapCamera.setBounds(0, 0, miniMapWidth, miniMapHeight);
    miniMapCamera.setSize(miniMapWidth, miniMapHeight);

    const miniMapX = 10; 
    const miniMapY = 10; 
    const miniMapScale = 0.2; 
    miniMapCamera.setPosition(miniMapX, miniMapY);
    miniMapCamera.setZoom(miniMapScale);
  }

  update() {

  }
}
