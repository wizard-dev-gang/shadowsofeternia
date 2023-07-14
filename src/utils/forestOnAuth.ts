import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import Forest from "../scenes/Forest";

export const setupFirebaseAuthForest = (gameInstance: Forest) => {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      gameInstance.playerId = user.uid; // Get the current player's ID
      const db = getDatabase(); // Get the Firebase database object
      gameInstance.playerRef = ref(db, `players/${gameInstance.playerId}`); // Reference to the current player in Firebase
      gameInstance.enemyDB = ref(db, `enemies`); // Reference to enemies in Firebase

      const otherPlayersRef = ref(db, "players"); // Reference to other players in Firebase

      if (gameInstance.characterName !== "rogue") {
        onValue(gameInstance.enemyDB, (snapshot) => {
          const enemiesData = snapshot.val();

          // Now handle the remaining players in Firebase
          for (const enemyId in enemiesData) {
            const enemyData = enemiesData[enemyId];

            let enemy = gameInstance.enemies.get(enemyId);

            if (!enemyData.isAlive && enemy) {
              enemy.setVisible(false);
              enemy.destroy();
              gameInstance.enemies.delete(enemyId);
              continue;
            }
            // Create or update other players
            if (!enemy) {
              enemy = gameInstance.skeletons.get(
                enemyData.x,
                enemyData.y,
                "jacked-skeleton"
              ); // Create a sprite for the other player
              gameInstance.enemies.set(enemyId, enemy);
            }
            enemy.x = enemyData.x;
            enemy.y = enemyData.y;

            // Play animation and set frame for other players
            if (enemyData.anim && enemyData.frame && enemyData.isAlive) {
              enemy.anims.play(enemyData.anim, true);
              enemy.anims.setCurrentFrame(
                enemy.anims.currentAnim.frames.find(
                  (f: any) => f.frame.name === enemyData.frame
                )
              );
            }
          }
        });
      }

      onValue(otherPlayersRef, (snapshot) => {
        const playersData = snapshot.val();

        gameInstance.otherPlayers.forEach((otherPlayer, playerId) => {
          const playerData = playersData[playerId];

          if (!playerData || !playerData.online) {
            otherPlayer.destroy(); // Remove sprite of other player
            gameInstance.otherPlayers.delete(playerId); // Remove other player from map

            const playerName = gameInstance.playerNames.get(playerId);
            if (playerName) {
              playerName.destroy(); // Remove player name
              gameInstance.playerNames.delete(playerId); // Remove player name from map
            }
          }
        });

        // Now handle the remaining players in Firebase
        for (const playerId in playersData) {
          if (playerId === gameInstance.playerId) continue; // Skip the current player

          const playerData = playersData[playerId];

          // Skip if player is not online
          if (!playerData.online) continue;

          let otherPlayer = gameInstance.otherPlayers.get(playerId);

          // Create or update other players
          if (!otherPlayer) {
            otherPlayer = gameInstance.add.player(
              playerData.x,
              playerData.y,
              "man"
            ); // Create a sprite for the other player
            gameInstance.otherPlayers.set(playerId, otherPlayer);
          }
          otherPlayer.x = playerData.x;
          otherPlayer.y = playerData.y;

          if (playerData.projectilesFromDB)
            otherPlayer.setProjectiles(gameInstance.projectiles);
          for (const projectileId in playerData.projectilesFromDB) {
            const projectileData = playerData.projectilesFromDB[projectileId];
            otherPlayer.throwProjectile(
              projectileData.direction,
              projectileData.x,
              projectileData.y,
              projectileData.attackObj
            );
          }

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
