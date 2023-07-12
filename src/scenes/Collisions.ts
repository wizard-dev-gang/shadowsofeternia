import Phaser, { GameObjects } from "phaser";
import { Slime } from "../enemies/Slime";
import { Player } from "../characters/Player";
import { Skeleton } from "../enemies/Skeleton";
import { sceneEvents } from "../events/EventsCenter";
import { Barb } from "../characters/Barb";
import "../characters/Archer";
import { Wizard } from "../characters/Wizard";
import { Archer } from "../characters/Archer";
import { Npc_wizard } from "../characters/Npc";
import "../characters/Npc";

export class CollisionHandler {
  projectiles: Phaser.Physics.Arcade.Group;
  skeletons: Phaser.Physics.Arcade.Group;
  slimes: Phaser.Physics.Arcade.Group;
  time: Phaser.Time.Clock;
  Npc_wizard!: Phaser.Physics.Arcade.Group;

  constructor(
    projectiles: Phaser.Physics.Arcade.Group,
    skeletons: Phaser.Physics.Arcade.Group,
    slimes: Phaser.Physics.Arcade.Group,
    time: Phaser.Time.Clock,
    Npc_wizard: Phaser.Physics.Arcade.Group
  ) {
    this.projectiles = projectiles;
    this.skeletons = skeletons;
    this.slimes = slimes;
    this.time = time;
    this.Npc_wizard = Npc_wizard;
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
      skeleton.destroy();
    }
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
  }

  // Method to handle collision between player and enemy characters
  handlePlayerEnemyCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    if (obj2 instanceof Skeleton) {
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
    npc: Phaser.GameObjects.GameObject,
  ) {
    // Check if the player is interacting with the wizard character
    if (
      player instanceof Player ||
      player instanceof Barb ||
      player instanceof Wizard ||
      (npc instanceof Npc_wizard && npc instanceof Npc_wizard)
    ) {
      // Perform actions for interacting with the NPC
      console.log("Interacting with the NPC Wizard");

      // Add text on the screen
      const text = this.add.text(1876, 1028, "Hello World!", {
        fontSize: "11px",
        color: "#000000",
        padding: {
          left: 10,
          right: 10,
          top: 5,
          bottom: 5,
        },
      });
      text.setOrigin(0.5, 1.4);
      text.setDepth(1);

      // Add a background image behind the text
      const background = this.add.image(1876, 1028, "text-bubble");
      background.setDisplaySize(text.width, text.height);
      background.setOrigin(0.53, 1.5);
      background.setDepth(0);

      // Remove the text after a certain delay
      this.time.delayedCall(2000, () => {
        text.destroy();
        background.destroy();
      });
    }
  }
}
