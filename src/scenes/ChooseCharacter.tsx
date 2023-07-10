import Phaser from "phaser";
// import Game from "../scenes/Game";
import { createCharacterAnims } from "../anims/CharacterAnims";
import { getAuth } from "firebase/auth";
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
import { useRef } from "react";

// const LOBBY_SIZE = 4;

// async function writeUserData(character, scene) {
//   const auth = getAuth(firebaseApp);
//   const user = auth.currentUser;

//   if (user) {
//     const playerId = user.uid;
//     const db = getDatabase(firebaseApp);

//     const playerRef = ref(db, "players/" + playerId);
//     const roomsRef = ref(db, "rooms");

//     await update(playerRef, {
//       character: character,
//     })
//       .then(() => {
//         console.log("Character chosen");
//       })
//       .catch((error) => {
//         console.error("Error choosing character:", error);
//       });

//     let roomId = "";

//     // Get a reference to the selected characters in the database
//     const selectedCharactersRef = ref(db, "selectedCharacters");

//     let isCharacterAvailable = false;

//     // Check if the character is already selected
//     await get(selectedCharactersRef).then((snapshot) => {
//       const selectedCharacters = snapshot.val();

//       if (!selectedCharacters || !selectedCharacters[character]) {
//         // If the character is not selected yet, mark it as available
//         isCharacterAvailable = true;
//       }
//     });

//     if (!isCharacterAvailable) {
//       console.error("Character is already chosen");
//       return;
//     }

//     // Mark the character as selected in the database
//     await set(ref(db, `selectedCharacters/${character}`), true);

//     // const newPlayerInLobbyRef = push(lobbyRef);

//     await get(roomsRef).then((snapshot) => {
//       const rooms = snapshot.val();

//       if (rooms) {
//         //Find an open room
//         for (const [id, room] of Object.entries(rooms)) {
//           if (Object.keys(room.players).length < LOBBY_SIZE) {
//             roomId = id;
//             break;
//           }
//         }
//       }

//       if (!roomId) {
//         const newRoomRef = push(roomsRef);
//         roomId = newRoomRef.key;
//         set(newRoomRef, {
//           players: {
//             [playerId]: true,
//           },
//         });
//       } else {
//         //Join an open room
//         const roomPlayersRef = ref(db, `rooms/${roomId}/players/${playerId}`);
//         set(roomPlayersRef, true);
//       }
//     });

//     const currentRoomRef = ref(db, "rooms/" + roomId);

//     onDisconnect(selectedCharactersRef).update({ [character]: false });
//     onDisconnect(currentRoomRef)
//       .remove()
//       .then(() => {
//         console.log("Prepared to remove player from lobby upon disconnect.");
//       })
//       .catch((error) => {
//         console.error("Error setting up onDisconnect:", error);
//       });

//     onValue(currentRoomRef, (snapshot) => {
//       if (
//         snapshot.hasChildren() &&
//         Object.keys(snapshot.val().players).length === LOBBY_SIZE
//       ) {
//         console.log("Game starting soon in room " + roomId);
//         setTimeout(() => {
//           scene.startGame();
//         }, 2000);
//       }
//     });
//   }
// }

export default class ChooseCharacterScene extends Phaser.Scene {
  constructor() {
    super("chooseCharacter");
  }

  preload() {
    this.load.image(
      "pixel-art-night-sky-background",
      "/assets/pixel-art-night-sky-background.png"
    );

    this.load.spritesheet("character1", "/assets/manAlone.png", {
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
    this.load.spritesheet("wizard", "/assets/wizard-alone.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.bitmapFont(
      "Joystix",
      "/assets/fonts/Joystix.png",
      "/assets/fonts/Joystix.fnt"
    );
  }

  create() {
    // this.textures.setFilter(Phaser.Textures.FilterMode.NEAREST);

    let hasChosenCharacter = false;

    this.add
      .image(0, 0, "pixel-art-night-sky-background")
      .setOrigin(0, 0)
      .setScale(0.8);

    this.add
      .text(this.sys.game.config.width / 2, 36, "Select a Character", {
        fontSize: "28px",
        fontFamily: "Joystix",
        align: "center",
      })
      .setOrigin(0.5);

    const character1 = this.add
      .sprite(90, 200, "character1")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character2 = this.add
      .sprite(180, 200, "barb")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character3 = this.add
      .sprite(270, 200, "archer")
      .setScale(2)
      .setInteractive({ useHandCursor: true });
    const character4 = this.add
      .sprite(360, 200, "wizard")
      .setScale(2)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(80, 280, "Character 1", {
        fontSize: "10px",
        fontFamily: "Joystix",
        align: "center",
      })
      .setOrigin(0.5);
    this.add
      .text(193.33, 280, "Barbarian", {
        fontSize: "10px",
        fontFamily: "Joystix",
        align: "center",
      })
      .setOrigin(0.5);
    this.add
      .text(306.66, 280, "Archer", {
        fontSize: "10px",
        fontFamily: "Joystix",
        align: "center",
      })
      .setOrigin(0.5);
    this.add
      .text(420, 280, "Wizard", {
        fontSize: "10px",
        fontFamily: "Joystix",
        align: "center",
      })
      .setOrigin(0.5);

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
      this.startGame();
      // if (!hasChosenCharacter) {
      //   const isCharacterAvailable = await writeUserData("character1", this);
      //   if (isCharacterAvailable) {
      //     hasChosenCharacter = true;
      //   }
      // }
    });
    character2.on("pointerdown", async () => {
      this.startGame("barb");
      // if (!hasChosenCharacter) {
      //   const isCharacterAvailable = await writeUserData("barb", this);
      //   if (isCharacterAvailable) {
      //     hasChosenCharacter = true;
      //   }
      // }
    });
    character3.on("pointerdown", async () => {
      if (!hasChosenCharacter) {
        const isCharacterAvailable = await writeUserData("archer", this);
        if (isCharacterAvailable) {
          hasChosenCharacter = true;
        }
      }
    });
    character4.on("pointerdown", async () => {
      if (!hasChosenCharacter) {
        const isCharacterAvailable = await writeUserData("wizard", this);
        if (isCharacterAvailable) {
          hasChosenCharacter = true;
        }
      }
    });
  }

  startGame(name?: string) {
    this.scene.start("game", {
      name,
    });
  }
}
