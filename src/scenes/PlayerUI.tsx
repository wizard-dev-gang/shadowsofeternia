import Phaser from "phaser";
import HealthBar from "./HealthBar";
import { sceneEvents } from "../events/EventsCenter";

export default class PlayerUI extends Phaser.Scene {
  private bar!: HealthBar;

  constructor() {
    super({ key: "player-ui" });
  }
  create() {
    const y = 290;
    const x = 10;
    const fullWidth = 100;

    this.add.text(x, y - 25, "Health", {
      fontSize: "10px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 5,
    });

    sceneEvents.on(
      "player-health-changed",
      this.handlePlayerHealthChanged,
      this
    );
    sceneEvents.on(
      "player-max-health-changed",
      this.handlePlayerMaxHealthChanged,
      this
    );

    this.bar = new HealthBar(this, x, y, fullWidth)
      .withLeftCap(this.add.image(0, 0, "healthBar-left-cap"))
      .withMiddle(this.add.image(0, 0, "healthBar-middle"))
      .withRightCap(this.add.image(0, 0, "healthBar-right-cap"))

      .layout();
    // is used to animate the bar going to 50%
    // .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {*insert bar.animateToFill})
    //this.bar.animateToFill(0.5)

    // private handlePlayerHealthChanged(health: number)
  }

  private handlePlayerHealthChanged(health: number) {
    console.log("in player health changed", health);
    //Requires two arguments, health and duration(ms)
    this.bar.animateToFill(health / 10, 1000);
  }
  private handlePlayerMaxHealthChanged(maxHealth: number) {
    console.log("Player's max health changed:", maxHealth);
    // Update the width of the health bar to match the new max health value
    this.bar.layout();
  }  
}
