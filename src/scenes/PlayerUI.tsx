import Phaser from "phaser";
import HealthBar from "./HealthBar";
import { sceneEvents } from "../events/EventsCenter";
import { Player } from "../characters/Player";
import { Archer } from "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import { Barb } from "../characters/Barb";

export default class PlayerUI extends Phaser.Scene {
  private bar!: HealthBar;
  // private player?: Player;
  // private archer?: Archer;
  // private wizard?: Wizard;
  // private barb?: Barb;
  private currentCharacter?: Player | Archer | Wizard | Barb; // Store the current character
  private fillRatio: number = 1;
  private characters: Array<Player | Archer | Wizard | Barb> = [];

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

    this.characters.push(new Player(this, 0, 0, "player", 0));

    this.characters.push(new Archer(this, 0, 0, "archer", 0));

    this.characters.push(new Wizard(this, 0, 0, "wizard", 0));

    this.characters.push(new Barb(this, 0, 0, "barb", 0));

    this.currentCharacter = this.characters[0]; // Set the current character to the player (or whichever character you want to start with)
  }

  private handlePlayerHealthChanged(health: number) {
    console.log("Player health changed", health);
    const maxHealth = this.currentCharacter?.maxHealth;
    const fillRatio = health / maxHealth!;
    this.bar.animateToFill(fillRatio, 1000);
    this.fillRatio = fillRatio; // Store the fill ratio
  }

  private handlePlayerMaxHealthChanged(maxHealth: number) {
    console.log("Player's max health changed:", maxHealth);
    if (this.currentCharacter) {
      const newFillRatio =
        this.fillRatio * (this.currentCharacter.maxHealth / maxHealth); // Calculate the new fill ratio based on the stored fill ratio and the updated max health
      this.bar.animateToFill(newFillRatio, 1000);
      this.currentCharacter.maxHealth = maxHealth;
    }
  }

  // Implement a method to switch characters:
  public switchCharacter(character: Player | Archer | Wizard | Barb) {
    this.currentCharacter = character;
  }
}
