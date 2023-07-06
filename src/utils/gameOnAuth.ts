import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import Game from "../scenes/Game";

export const setupFirebaseAuth = (gameInstance: Game) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      gameInstance.playerId = user.uid; // Get the current player's ID
      const db = getDatabase(); // Get the Firebase database object
      gameInstance.playerRef = ref(db, `players/${gameInstance.playerId}`); // Reference to the current player in Firebase

      const otherPlayersRef = ref(db, "players"); // Reference to other players in Firebase
      onValue(otherPlayersRef, (snapshot) => {
        const playersData = snapshot.val();
        for (const playerId in playersData) {
          if (playerId === gameInstance.playerId) continue; // Skip the current player

          const playerData = playersData[playerId];
          let otherPlayer = gameInstance.otherPlayers.get(playerId);

          // Create or update other players
          if (!otherPlayer) {
            otherPlayer = gameInstance.physics.add.sprite(
              playerData.x,
              playerData.y,
              "man"
            ); // Create a sprite for the other player
            gameInstance.otherPlayers.set(playerId, otherPlayer);
          }
          otherPlayer.x = playerData.x;
          otherPlayer.y = playerData.y;

          // Play animation and set frame for other players
          if (playerData.anim && playerData.frame) {
            otherPlayer.anims.play(playerData.anim, true);
            otherPlayer.anims.setCurrentFrame(
              otherPlayer.anims.currentAnim.frames.find(
                (f: any) => f.frame.name === playerData.frame
              )
            );
          }

          // Create or update player names
          let playerName = gameInstance.playerNames.get(playerId);
          if (!playerName) {
            playerName = gameInstance.add
              .text(0, 0, playerData.name, {
                fontSize: "10px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
              })
              .setOrigin(0.5, 0.01);
            gameInstance.playerNames.set(playerId, playerName);
          }
          // Player name position
          playerName.x = otherPlayer.x;
          playerName.y = otherPlayer.y - 20;
        }
      });
    }
  });
};
