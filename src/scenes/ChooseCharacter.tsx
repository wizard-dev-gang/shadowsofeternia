import Phaser from "phaser";
// import Game from "../scenes/Game";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { getAuth } from "firebase/auth";
import { removeAllEnemiesFromDatabase } from "../../functions/lib/enemySupport";
import {
  getDatabase,
  ref,
  update,
  onValue,
  set,
  get,
  push,
  onDisconnect,
} from "firebase/database";
import { app as firebaseApp } from "../../functions/lib/firebaseConfig";

const LOBBY_SIZE = 4;

async function writeUserData(character: string, scene: ChooseCharacterScene) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (user) {
    const playerId = user.uid;
    const db = getDatabase(firebaseApp);

    const playerRef = ref(db, "players/" + playerId);
    const roomsRef = ref(db, "rooms");

    await update(playerRef, {
      character: character,
    })
      .then(() => {
        console.log("Character chosen");
      })
      .catch((error) => {
        console.error("Error choosing character:", error);
      });

    let roomId = "";

    // Get a reference to the selected characters in the database
    const selectedCharactersRef = ref(db, "selectedCharacters");

    let isCharacterAvailable = false;

    // Check if the character is already selected
    await get(selectedCharactersRef).then((snapshot) => {
      const selectedCharacters = snapshot.val();

      if (!selectedCharacters || !selectedCharacters[character]) {
        // If the character is not selected yet, mark it as available
        isCharacterAvailable = true;
      }
    });

    if (!isCharacterAvailable) {
      console.error("Character is already chosen");
      return false;
    }

    // Mark the character as selected in the database
    await set(ref(db, `selectedCharacters/${character}`), true);


    await get(roomsRef).then((snapshot) => {
      const rooms = snapshot.val() as Record<
        string,
        { players: Record<string, boolean> }
      >;

      if (rooms) {
        //Find an open room
        for (const [id, room] of Object.entries(rooms)) {
          if (Object.keys(room.players).length < LOBBY_SIZE) {
            roomId = id;
            break;
          }
        }
      }

      if (!roomId) {
        const newRoomRef = push(roomsRef);
        if (newRoomRef.key !== null) {
          roomId = newRoomRef.key;
        }
        set(newRoomRef, {
          players: {
            [playerId]: true,
          },
        });
      } else {
        //Join an open room
        const roomPlayersRef = ref(db, `rooms/${roomId}/players/${playerId}`);
        set(roomPlayersRef, true);
      }
    });

    const currentRoomRef = ref(db, "rooms/" + roomId);

    onDisconnect(selectedCharactersRef).update({ [character]: false });
    onDisconnect(currentRoomRef)
      .remove()
      .then(() => {
        console.log("Prepared to remove player from lobby upon disconnect.");
      })
      .catch((error) => {
        console.error("Error setting up onDisconnect:", error);
      });

    onValue(currentRoomRef, (snapshot) => {
      if (
        snapshot.hasChildren() &&
        Object.keys(snapshot.val().players).length === LOBBY_SIZE
      ) {
        console.log("Game starting soon in room " + roomId);
        setTimeout(() => {
          scene.startGame(character);
        }, 2000);
      }
    });
  }
  return true;
}

export default class ChooseCharacterScene extends Phaser.Scene {
  constructor() {
    super("chooseCharacter");
  }

  // private backgroundMusic?: Phaser.Sound.BaseSound;
  preload() {
    this.load.image("pansbg", "/assets/pansbg.png");

    this.load.spritesheet("rogue", "/assets/man.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("barb", "/assets/barb.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("archer", "/assets/archer.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("wizard", "/assets/wizard.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.bitmapFont(
      "Joystix",
      "/assets/fonts/Joystix.png",
      "/assets/fonts/Joystix.fnt"
    );

    this.load.audio("lobbyMusic", "/music/loopMusic.mp3");
  }

  create() {
    const backgroundMusic = this.sound.add("lobbyMusic");

    // Configure the audio to loop
    backgroundMusic.setLoop(true);

    // Play the audio
    backgroundMusic.play();


    let hasChosenCharacter = false; // This is okay to be unassigned for now. It will be assigned when the user chooses a character.

    this.add.image(0, 10, "pansbg").setOrigin(0, 0.1).setScale(0.5);

    this.add
      .text(
        (this.sys.game.config.width as number) / 2,
        36,
        "Select a Character",
        {
          fontSize: "28px",
          fontFamily: "Joystix",
          align: "center",
        }
      )
      .setOrigin(0.5);

    const character1 = this.add
      .sprite(50, 200, "man")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character2 = this.add
      .sprite(150, 200, "barb")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character3 = this.add
      .sprite(250, 200, "archer")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character4 = this.add
      .sprite(350, 200, "wizard")
      .setScale(2)
      .setInteractive({ useHandCursor: true });

    const char1Text = this.add
      .text(50, 270, "Rogue", {
        fontSize: "20px",
        fontFamily: "Joystix",
        align: "center",
        color: "#000000",
      })
      .setOrigin(0.5);
    char1Text.setWordWrapWidth(8);
    char1Text.setLineSpacing(1);
    // char1Text.setScale(0.25);
    const char2Text = this.add
      .text(150, 270, "Barbarian", {
        fontSize: "20px",
        fontFamily: "Joystix",
        align: "center",
        color: "#000000",
      })
      .setOrigin(0.5);
    char2Text.setWordWrapWidth(10);
    char2Text.setLineSpacing(1);
    // char2Text.setScale(0.25);
    const char3Text = this.add
      .text(250, 270, "Archer", {
        fontSize: "20px",
        fontFamily: "Joystix",
        align: "center",
        color: "#000000",
      })
      .setOrigin(0.5);
    char3Text.setWordWrapWidth(10);
    char3Text.setLineSpacing(1);
    // char3Text.setScale(0.25);
    const char4Text = this.add
      .text(350, 270, "Wizard", {
        fontSize: "20px",
        fontFamily: "Joystix",
        align: "center",
        color: "#000000",
      })
      .setOrigin(0.5);
    char4Text.setWordWrapWidth(10);
    char4Text.setLineSpacing(1);
    // char4Text.setScale(0.25);

    createCharacterAnims(this.anims);

    //Created a slow walking animation for this scene
    this.anims.create({
      key: "man-walk-down-slow",
      frames: this.anims.generateFrameNames("man", {
        start: 1,
        end: 3,
        prefix: "man-walk-down-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });
    this.anims.create({
      key: "barb-walk-down-slow",
      frames: this.anims.generateFrameNames("barb", {
        start: 1,
        end: 3,
        prefix: "barb-walk-down-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({
      key: "archer-walk-down-slow",
      frames: this.anims.generateFrameNames("archer", {
        start: 1,
        end: 3,
        prefix: "archer-walk-down-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    this.anims.create({
      key: "wizard-walk-down-slow",
      frames: this.anims.generateFrameNames("wizard", {
        start: 1,
        end: 3,
        prefix: "wizard-walk-down-0",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 10,
    });

    // Start animation on hover
    character1.on("pointerover", () => {
      character1.anims.play("man-walk-down-slow", true);
    });
    character1.on("pointerout", () => {
      character1.anims.stop();
    });

    character2.on("pointerover", () => {
      character2.anims.play("barb-walk-down-slow", true);
    });
    character2.on("pointerout", () => {
      character2.anims.stop();
    });

    character3.on("pointerover", () => {
      character3.anims.play("archer-walk-down-slow", true);
    });
    character3.on("pointerout", () => {
      character3.anims.stop();
    });

    character4.on("pointerover", () => {
      character4.anims.play("wizard-walk-down-slow", true);
    });
    character4.on("pointerout", () => {
      character4.anims.stop();
    });

    character1.on("pointerdown", async () => {
      this.startGame("rogue"); // Comment this line for final build
      // if (!hasChosenCharacter) {
      //  const isCharacterAvailable = await writeUserData("rogue", this);
      //  if (isCharacterAvailable) {
      //    char1Text.setText("Rogue (Selected)");
      //    hasChosenCharacter = true;
      //  }
      // }
    });
    character2.on("pointerdown", async () => {
      this.startGame("barb");
      // if (!hasChosenCharacter) {
      //   const isCharacterAvailable = await writeUserData("barb", this);
      //   if (isCharacterAvailable) {
      //     char2Text.setText("Barbarian (Selected)");
      //     hasChosenCharacter = true;
      //   }
      // }
    });
    character3.on("pointerdown", async () => {
      // this.startGame("archer");
      if (!hasChosenCharacter) {
        const isCharacterAvailable = await writeUserData("archer", this);
        if (isCharacterAvailable) {
          char3Text.setText("Archer (Selected)");
          hasChosenCharacter = true;
        }
      }
    });
    character4.on("pointerdown", async () => {
      // this.startGame("wizard");
      if (!hasChosenCharacter) {
        const isCharacterAvailable = await writeUserData("wizard", this);
        if (isCharacterAvailable) {
          char4Text.setText("Wizard (Selected)");
          hasChosenCharacter = true;
        }
      }
    });
  }

  startGame(name?: string) {
    this.sound.stopAll();
    removeAllEnemiesFromDatabase();
    this.scene.start("game", {
      name,
    });
  }
}
