import Phaser from "phaser";
import HealthBar from "./HealthBar";
import { sceneEvents } from "../events/EventsCenter";
import { Player } from "../characters/Player";
import { Archer } from "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import { Barb } from "../characters/Barb";

export default class PlayerUI extends Phaser.Scene {
  private bar!: HealthBar;
  private player?: Player;
  private fillRatio: number = 1;

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

    // Instantiate the players
    this.player = new Player(this, 0, 0, "player", 0);
  }

  private handlePlayerHealthChanged(health: number) {
    console.log("Player health changed", health);
    const maxHealth = this.player?.maxHealth;
    const fillRatio = health / maxHealth!;
    this.bar.animateToFill(fillRatio, 1000);
    this.fillRatio = fillRatio; // Store the fill ratio
  }

  private handlePlayerMaxHealthChanged(maxHealth: number) {
    console.log("Player's max health changed:", maxHealth);
    if (this.player) {
      const newFillRatio = this.fillRatio * (this.player.maxHealth / maxHealth); // Calculate the new fill ratio based on the stored fill ratio and the updated max health
      this.bar.animateToFill(newFillRatio, 1000);
      this.player.maxHealth = maxHealth;
    }
  }
}
