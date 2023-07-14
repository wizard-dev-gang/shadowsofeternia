import Phaser, { GameObjects } from "phaser";
import { Slime } from "../enemies/Slime";
import { Player } from "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import { Boss } from "../enemies/Boss";
import { sceneEvents } from "../events/EventsCenter";
import { Barb } from "../characters/Barb";
import "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import { Archer } from "../characters/Archer";
import { Npc_wizard } from "../characters/Npc";
import "../characters/Npc";
import { Potion } from "../characters/Potion";
// import { getDatabase, ref, onValue } from "firebase/database";
// import { useRef } from "react";
// import { setupFirebaseAuth } from "../utils/gameOnAuth";

export class CollisionHandler {
  projectiles: Phaser.Physics.Arcade.Group;
  skeletons: Phaser.Physics.Arcade.Group;
  bosses: Phaser.Physics.Arcade.Group;
  slimes: Phaser.Physics.Arcade.Group;
  time: Phaser.Time.Clock;
  Npc_wizard!: Phaser.Physics.Arcade.Group;
  add: GameObjects.GameObjectFactory;
  potion: Potion;
  private man?: Player; //Rogue Character
  private barb?: Barb; //Barbarian Character
  private archer?: Archer; //Archer Character
  private wizard?: Wizard; //Wizard Character

  //Firebase
  playerId: string | null;
  playerRef!: any;

  constructor(
    projectiles: Phaser.Physics.Arcade.Group,
    skeletons: Phaser.Physics.Arcade.Group,
    bosses: Phaser.Physics.Arcade.Group,
    slimes: Phaser.Physics.Arcade.Group,
    time: Phaser.Time.Clock,
    Npc_wizard: Phaser.Physics.Arcade.Group,
    add: GameObjects.GameObjectFactory,
    potion: Potion,
    playerId: string | null
  ) {
    this.projectiles = projectiles;
    this.skeletons = skeletons;
    this.bosses = bosses;
    this.slimes = slimes;
    this.time = time;
    this.Npc_wizard = Npc_wizard;
    this.add = add;
    this.potion = potion;
    this.playerId = playerId;
  }

  // Method to handle collision between projectiles and walls
  handleProjectileWallCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj1 instanceof Phaser.GameObjects.Image) {
      const projectile = obj1 as Phaser.GameObjects.Image;
      projectile.destroy();
    }
  }

  // Method to handle collision between projectiles and Boss
  handleProjectileBossCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1;
    const boss = obj2;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile as GameObjects.Image);
    projectile.destroy();
    const dx =
      (boss as Phaser.GameObjects.Image).x -
      (projectile as Phaser.GameObjects.Image).x;
    const dy =
      (boss as Phaser.GameObjects.Image).y -
      (projectile as Phaser.GameObjects.Image).y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    (boss as Boss).setVelocity(dir.x, dir.y);
    (boss as Boss).getHealth();
    (boss as Boss).handleDamage(dir);
    if ((boss as Boss).getHealth() <= 0) {
      this.bosses.killAndHide(boss);
      (boss.isAlive = false), boss.destroy();
    }
    const playerCharacters = [this.barb, this.archer, this.wizard, this.man];
    playerCharacters.forEach((character) => {
      if (character) {
        character.exp++;
        console.log(`${character.constructor.name}'s exp: ${character.exp}`);
      }
    });
  }

  // Method to handle collision between projectiles and skeleton
  handleProjectileSkeletonCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1;
    const skeleton = obj2;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile as GameObjects.Image);
    projectile.destroy();
    const dx =
      (skeleton as Phaser.GameObjects.Image).x -
      (projectile as Phaser.GameObjects.Image).x;
    const dy =
      (skeleton as Phaser.GameObjects.Image).y -
      (projectile as Phaser.GameObjects.Image).y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    (skeleton as Skeleton).setVelocity(dir.x, dir.y);
    (skeleton as Skeleton).getHealth();
    (skeleton as Skeleton).handleDamage(dir);
    if ((skeleton as Skeleton).getHealth() <= 0) {
      this.skeletons.killAndHide(skeleton);
      (skeleton.isAlive = false), skeleton.destroy();
    }
    const playerCharacters = [this.barb, this.archer, this.wizard, this.man];
    playerCharacters.forEach((character) => {
      if (character) {
        character.exp++;
        console.log(`${character.constructor.name}'s exp: ${character.exp}`);
      }
    });
  }

  handleProjectileSlimeCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1 as Phaser.Physics.Arcade.Image;
    const slime = obj2 as Slime;

    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile);
    projectile.destroy();

    // Stop the slime from moving
    slime.isMoving = false;

    // Play slime death animation
    if (slime.anims) {
      slime.anims.play("slime-death");
    }

    // Kill and hide the slime after the animation completes
    this.time.delayedCall(1000, () => {
      this.slimes.killAndHide(slime);
      slime.destroy();
    });
    // Log players' x
    const playerCharacters = [this.barb, this.archer, this.wizard, this.man];
    playerCharacters.forEach((character) => {
      if (character) {
        character.exp++;
        console.log(`${character.constructor.name}'s exp: ${character.exp}`);
      }
    });
  }

  // Method to handle collision between player and boss characters
  handlePlayerBossCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    console.log("handleplayerEnemyCollision");
    if (
      (obj1 instanceof Player || Barb || Wizard || Archer) &&
      obj2 instanceof Boss
    ) {
      const man = (obj1 as Player) || Barb || Wizard || Archer;
      const boss = obj2 as Boss;

      const dx =
        (man as Phaser.GameObjects.Image).x -
        (boss as Phaser.GameObjects.Image).x;
      const dy =
        (man as Phaser.GameObjects.Image).y -
        (boss as Phaser.GameObjects.Image).y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      // console.log(man._health);
      sceneEvents.emit("player-health-changed", man.getHealth());
    }
  }

  // Method to handle collision between player and enemy characters
  handlePlayerEnemyCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    console.log("handleplayerEnemyCollision");
    if (
      (obj1 instanceof Player || Barb || Wizard || Archer) &&
      obj2 instanceof Skeleton
    ) {
      const man = (obj1 as Player) || Barb || Wizard || Archer;
      const skeleton = obj2 as Skeleton;

      const dx =
        (man as Phaser.GameObjects.Image).x -
        (skeleton as Phaser.GameObjects.Image).x;
      const dy =
        (man as Phaser.GameObjects.Image).y -
        (skeleton as Phaser.GameObjects.Image).y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      // console.log(man._health);
      sceneEvents.emit("player-health-changed", man.getHealth());
    }
  }

  handlePlayerSlimeCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj2 instanceof Slime) {
      let man;
      if (obj1 instanceof Player) {
        man = obj1 as Player;
      } else if (obj1 instanceof Barb) {
        man = obj1 as Barb;
      } else if (obj1 instanceof Wizard) {
        man = obj1 as Wizard;
      } else if (obj1 instanceof Archer) {
        man = obj1 as Archer;
      }

      if (man) {
        const slime = obj2 as Slime;

        const dx = man.x - slime.x;
        const dy = man.y - slime.y;

        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
        man.setVelocity(dir.x, dir.y);
        man.handleDamage(dir);
        sceneEvents.emit("player-health-changed", man.getHealth());
      }
    }
  }

  handlePlayerNpcCollision(
    player: Phaser.GameObjects.GameObject,
    npc: Phaser.GameObjects.GameObject
  ) {
    // Check if the player is interacting with the wizard character
    if (
      player instanceof Player ||
      player instanceof Barb ||
      player instanceof Wizard ||
      player instanceof Archer ||
      (npc instanceof Npc_wizard && npc instanceof Npc_wizard)
    ) {
      // Perform actions for interacting with the NPC
      console.log("Interacting with the NPC Wizard");

      const npcX = npc.x;
      const npcY = npc.y + 50;

      const textX = npcX;
      const textY = npcY;

      // Add text on the screen
      const text = this.add.text(textX, textY, npc.text, {
        fontSize: "11px",
        color: "#000000",
        padding: {
          left: 42,
          right: 42,
          top: 42,
          bottom: 42,
        },
      });
      text.setWordWrapWidth(200);
      text.setLineSpacing(1);
      text.setOrigin(0.5, 1.4);
      text.setDepth(1);

      // Add a background image behind the text
      const background = this.add.image(textX, textY, "text-bubble");
      background.setDisplaySize(text.width, text.height);
      background.setOrigin(0.53, 1.5);
      background.setDepth(0);

      // Remove the text after a certain delay
      this.time.delayedCall(3000, () => {
        text.destroy();
        background.destroy();
      });
    }
  }

  handlePlayerPotionCollision(
    player: Phaser.GameObjects.GameObject,
    potion: Potion
  ) {
    // Perform actions for interacting with the potion

    if (
      player instanceof Player ||
      player instanceof Barb ||
      player instanceof Wizard ||
      player instanceof Archer ||
      potion instanceof Phaser.GameObjects.GameObject
    ) {
      if (player instanceof Player) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Barb) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Wizard) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Archer) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      }
    }

    // Remove the potion from the scene
    potion.destroy();
  }
}
