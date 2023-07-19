import Phaser, { GameObjects } from "phaser";
import { Slime } from "../enemies/Slime";
import { BabySkeleton } from "../enemies/BabySkeleton";
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
import { Resurrect } from "../characters/Resurrect";
import { Dog } from "../characters/Dog";
import { Goblin } from "../enemies/Goblins";

export class CollisionHandler {
  projectiles: Phaser.Physics.Arcade.Group;
  skeletons: Phaser.Physics.Arcade.Group;
  boss: Phaser.Physics.Arcade.Group;
  slimes: Phaser.Physics.Arcade.Group;
  babySkeletons: Phaser.Physics.Arcade.Group;
  time: Phaser.Time.Clock;
  Npc_wizard!: Phaser.Physics.Arcade.Group;
  add: GameObjects.GameObjectFactory;
  public potion: Potion;
  private man?: Player; //Rogue Character
  private barb?: Barb; //Barbarian Character
  private archer?: Archer; //Archer Character
  private wizard?: Wizard; //Wizard Character
  private collideSound: Phaser.Sound.BaseSound;
  private resurrectSound: Phaser.Sound.BaseSound;
  private potionSound: Phaser.Sound.BaseSound;
  dog: Phaser.Physics.Arcade.Group;
  goblin: Phaser.Physics.Arcade.Group;
  private dogBark: Phaser.Sound.BaseSound;
  private npcHm: Phaser.Sound.BaseSound;
  private slimeDeathSound?: Phaser.Sound.BaseSound;
  private projectileHit?: Phaser.Sound.BaseSound;

  //Firebase
  playerId: string | null;
  playerRef!: any;

  constructor(
    projectiles?: Phaser.Physics.Arcade.Group,
    skeletons?: Phaser.Physics.Arcade.Group,
    boss?: Phaser.Physics.Arcade.Group,
    slimes?: Phaser.Physics.Arcade.Group,
    babySkeletons?: Phaser.Physics.Arcade.Group,
    time?: Phaser.Time.Clock,
    Npc_wizard?: Phaser.Physics.Arcade.Group,
    add?: GameObjects.GameObjectFactory,
    potion?: Potion,
    playerId?: string | null,
    dog?: Phaser.Physics.Arcade.Group,
    goblin?: Phaser.Physics.Arcade.Group,
    resurrect?: Resurrect,
    collideSound?: Phaser.Sound.BaseSound,
    resurrectSound?: Phaser.Sound.BaseSound,
    potionSound?: Phaser.Sound.BaseSound,
    dogBark?: Phaser.Sound.BaseSound,
    npcHm?: Phaser.Sound.BaseSound,
    slimeDeathSound?: Phaser.Sound.BaseSound,
    projectileHit?: Phaser.Sound.BaseSound
  ) {
    this.projectiles = projectiles;
    this.skeletons = skeletons;
    this.boss = boss;
    this.slimes = slimes;
    this.babySkeletons = babySkeletons;
    this.time = time;
    this.Npc_wizard = Npc_wizard;
    this.add = add;
    this.potion = potion;
    this.playerId = playerId;
    this.collideSound = collideSound;
    this.resurrectSound = resurrectSound;
    this.potionSound = potionSound;
    this.dog = dog;
    this.goblin = goblin;
    this.dogBark = dogBark;
    this.slimeDeathSound = slimeDeathSound;
    this.npcHm = npcHm;
    this.projectileHit = projectileHit;
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
    const boss = obj2 as Boss;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile as GameObjects.Image);
    projectile.destroy();
    const dx =
      (boss as Phaser.GameObjects.Image).x -
      (projectile as Phaser.GameObjects.Image).x;
    const dy =
      (boss as Phaser.GameObjects.Image).y -
      (projectile as Phaser.GameObjects.Image).y;

    this.projectileHit?.play();

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    (boss as Boss).setVelocity(dir.x, dir.y);
    (boss as Boss).getHealth();
    (boss as Boss).handleDamage(dir);
    if ((boss as Boss).getHealth() <= 0) {
      this.boss.killAndHide(boss);
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
    const skeleton = obj2 as Skeleton;
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
    (skeleton as Skeleton).handleDamage();

    this.projectileHit?.play();

    if ((skeleton as Skeleton).getHealth() <= 0) {
      this.skeletons.killAndHide(skeleton);
      (skeleton.isAlive = false), skeleton.destroy();

      // Generate a random number between 0 and 1
      const dropChance = Math.random();
      console.log("THIS IS THE DROP CHANCE VALUE", dropChance);
      // Check if the drop chance is less than or equal to 0.2 (20%)
      if (dropChance <= 0.2) {
        // Drop a potion at the skeleton's position
        this.potion.get(skeleton.x, skeleton.y, "potion");
      }
    }
    const playerCharacters = [this.barb, this.archer, this.wizard, this.man];
    playerCharacters.forEach((character) => {
      if (character) {
        character.exp++;
        console.log(`${character.constructor.name}'s exp: ${character.exp}`);
      }
    });
  }

  handleProjectileBSCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1 as Phaser.Physics.Arcade.Image;
    const babySkel = obj2 as BabySkeleton;

    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile);
    projectile.destroy();

    this.projectileHit?.play();

    (babySkel as BabySkeleton).handleDamage();
    // Kill and hide the baby-skeleton after the animation completes
    if ((babySkel as BabySkeleton).getHealth() <= 0) {
      this.time.delayedCall(1000, () => {
        this.skeletons.killAndHide(babySkel);
        babySkel.destroy();
      });
    }
    // Log players' x
    const playerCharacters = [this.barb, this.archer, this.wizard, this.man];
    playerCharacters.forEach((character) => {
      if (character) {
        character.exp++;
        console.log(`${character.constructor.name}'s exp: ${character.exp}`);
      }
    });
  }
  handleProjectileGoblinCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const projectile = obj1;
    const goblin = obj2 as Goblin;
    // Kill and hide the projectile
    this.projectiles.killAndHide(projectile);
    projectile.destroy();
    const dx =
      (goblin as Phaser.GameObjects.Image).x -
      (projectile as Phaser.GameObjects.Image).x;
    const dy =
      (goblin as Phaser.GameObjects.Image).y -
      (projectile as Phaser.GameObjects.Image).y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    (goblin as Goblin).setVelocity(dir.x, dir.y);
    (goblin as Goblin).getHealth();
    (goblin as Goblin).handleDamage();

    if ((goblin as Goblin).getHealth() <= 0) {
      this.goblin.killAndHide(goblin);
      (goblin.isAlive = false), goblin.destroy();

      // Generate a random number between 0 and 1
      const dropChance = Math.random();
      console.log("THIS IS THE DROP CHANCE VALUE", dropChance);
      // Check if the drop chance is less than or equal to 0.2 (20%)
      if (dropChance <= 0.2) {
        // Drop a potion at the goblin's position
        this.potion.get(goblin.x, goblin.y, "potion");
      }
    }

    this.projectileHit?.play();

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
    slime.isAlive = false;
    // Stop the slime from moving
    slime.isMoving = false;

    // Play slime death animation
    if (slime.anims) {
      slime.anims.play("slime-death");
    }

    this.projectileHit?.play();

    // Kill and hide the slime after the animation completes
    this.time.delayedCall(1000, () => {
      this.slimeDeathSound?.play();
      this.slimes.killAndHide(slime);
      slime.destroy();
      // Generate a random number between 0 and 1
      const dropChance = Math.random();
      console.log(dropChance);
      // Check if the drop chance is less than or equal to 0.1 (10%)
      if (dropChance <= 0.1) {
        // Drop a potion at the slime's position
        this.potion.get(slime.x, slime.y, "potion");
      }
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

  // Method to handle collision between player and enemy characters
  handlePlayerEnemyCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    console.log("handleplayerEnemyCollision");
    if (
      (obj1 instanceof Player || Barb || Wizard || Archer) &&
      (obj2 instanceof Skeleton || BabySkeleton || Boss)
    ) {
      const man = (obj1 as Player) || Barb || Wizard || Archer;
      const skeleton = (obj2 as Skeleton) || BabySkeleton || Boss;

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
      this.collideSound.play();
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
        this.collideSound.play();
      }
    }
  }
  handlePlayerGoblinCollision(
    obj1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    obj2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ) {
    console.log("handleplayerGoblinCollision");
    if (
      (obj1 instanceof Player || Barb || Wizard || Archer) &&
      obj2 instanceof Goblin
    ) {
      const man = (obj1 as Player) || Barb || Wizard || Archer;
      const goblin = obj2 as Goblin;

      const dx =
        (man as Phaser.GameObjects.Image).x -
        (goblin as Phaser.GameObjects.Image).x;
      const dy =
        (man as Phaser.GameObjects.Image).y -
        (goblin as Phaser.GameObjects.Image).y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
      man.setVelocity(dir.x, dir.y);
      man.handleDamage(dir);
      // console.log(man._health);
      sceneEvents.emit("player-health-changed", man.getHealth());
      this.collideSound.play();
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
      this.npcHm.play();

      const npcX = npc.x;
      const npcY = npc.y + 55;

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

  handlePlayerDogCollision(
    player: Phaser.GameObjects.GameObject,
    dog: Phaser.GameObjects.GameObject
  ) {
    // Check if the player is interacting with the dog
    if (
      player instanceof Player ||
      player instanceof Barb ||
      player instanceof Wizard ||
      player instanceof Archer ||
      (dog instanceof Dog && dog instanceof Dog)
    ) {
      // Perform actions for interacting with the NPC
      console.log("Interacting with the Dog");
      this.dogBark.play();

      // Stop the dog from moving
      if (dog instanceof Dog) {
        dog.isMoving = false;
      }

      const dogX = dog.x;
      const dogY = dog.y + 50;

      const textX = dogX;
      const textY = dogY - 30;

      // Add text on the screen
      const text = this.add.text(textX, textY, dog.text, {
        fontSize: "11px",
        color: "#000000",
        padding: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
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
      this.time.delayedCall(500, () => {
        text.destroy();
        background.destroy();
        // allow the dog to move
        if (dog instanceof Dog) {
          dog.isMoving = true;
        }
      });
    }
  }

  handlePlayerPotionCollision(
    player: Phaser.GameObjects.GameObject,
    potion: Potion
  ) {
    // Check if the player is alive
    if (
      (player instanceof Player ||
        player instanceof Barb ||
        player instanceof Wizard ||
        player instanceof Archer) &&
      !player.isDead
    ) {
      // Apply potion effects only if the player is alive
      if (player instanceof Player && player.isDead === false) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Barb && player.isDead === false) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Wizard && player.isDead === false) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      } else if (player instanceof Archer && player.isDead === false) {
        player.increaseHealth(5);
        sceneEvents.emit("player-health-changed", player.getHealth());
        console.log("Potion Picked Up HP:", player.getHealth());
      }

      // Remove the potion only if the player is alive
      this.potionSound.play();
      potion.destroy();
    }
  }

  handlePlayerResurrectCollision(
    player: Phaser.GameObjects.GameObject,
    resurrect: Resurrect
  ) {
    // Check if the player is dead
    if (
      (player instanceof Player ||
        player instanceof Barb ||
        player instanceof Wizard ||
        player instanceof Archer) &&
      resurrect instanceof Resurrect &&
      player.isDead
    ) {
      // Perform actions for interacting with the resurrect
      player.increaseHealth(5);
      sceneEvents.emit("player-health-changed", player.getHealth());
      console.log("Resurrect Picked Up, New HP:", player.getHealth());
      player.isDead = false;

      this.resurrectSound.play();
      resurrect.destroy();
    }
  }
}
