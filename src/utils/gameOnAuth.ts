import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  onValue,
  onDisconnect,
  remove,
} from "firebase/database";
import Game from "../scenes/Game";
import Ruins from "../scenes/Ruins";
import Forest from "../scenes/Forest";
import BossMap from "../scenes/BossMap";
import Player from "../characters/Player";

type SceneType = Game | Ruins | Forest | BossMap;

const SESSION_TIMEOUT = 1000 * 60 * 1; // 5 minutes

export const setupFirebaseAuth = (gameInstance: SceneType) => {
  const auth = getAuth();
  const otherPlayers = new Map();
  gameInstance.enemies = new Map();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      gameInstance.playerId = user.uid; // Get the current player's ID
      const db = getDatabase(); // Get the Firebase database object
      gameInstance.playerRef = ref(db, `players/${gameInstance.playerId}`); // Reference to the current player in Firebase
      onDisconnect(gameInstance.playerRef).remove(); // Remove the current player when they disconnect
      gameInstance.enemyDB = ref(db, `enemies`); // Reference to enemies in Firebase
      // Set up session timeout
      const sessionTimeoutRef = ref(
        db,
        `sessionTimeouts/${gameInstance.playerId}`
      );
      let sessionTimeout: any;

      const updateSessionTimeout = () => {
        // Clear the old timeout
        clearTimeout(sessionTimeout);
        // Set a new timeout
        sessionTimeout = setTimeout(() => {
          // Update the database
          set(sessionTimeoutRef, false);
        }, SESSION_TIMEOUT);
        // Specify what should happen if the client disconnects before the timeout
        onDisconnect(sessionTimeoutRef).set(false);
        // If still connected, set to true
        set(sessionTimeoutRef, true);
      };

      // Update the session timeout whenever the player does something
      gameInstance.events.on("playerAction", updateSessionTimeout);

      onValue(sessionTimeoutRef, (snapshot) => {
        if (snapshot.val() === false) {
          // The session has timed out, so we remove the player
          remove(gameInstance.playerRef);
          remove(sessionTimeoutRef);
        }
      });

      updateSessionTimeout();
      let playerScene: any;
      const otherPlayersRef = ref(db, "players"); // Reference to other players in Firebase

      if (gameInstance.characterName !== "rogue") {
        onValue(gameInstance.enemyDB, (snapshot) => {
          const enemiesData = snapshot.val();

          // Now handle the remaining players in Firebase
          for (const enemyId in enemiesData) {
            const enemyData = enemiesData[enemyId];
            //console.log(enemyData.scene, user)
            if (enemyData.scene != playerScene || !enemyData.isAlive) continue;

            let enemy = gameInstance.enemies.get(enemyId);

            if (!enemyData.isAlive && enemy) {
              enemy.setVisible(false);
              enemy.destroy();
              gameInstance.enemies.delete(enemyId);
              continue;
            }
            // Create or update other players
            if (!enemy) {
              let enemySelector = "ph";
              switch (enemyData.anim.split("-")[0]) {
                case "enemy":
                  enemySelector = "skeletons";
                  break;
                case "slime":
                  enemySelector = "slimes";
                  break;
                case "boss":
                  enemySelector = "boss";
                  break;
                case "baby-skeleton":
                  enemySelector = "skeletons";
                  break;
                case "goblin":
                  enemySelector = "goblin";
              }
              const enemyGroup = gameInstance.enemyDB[enemySelector];
              if (!enemyGroup)
                throw new Error(`No enemy group named ${enemySelector}`);

              enemy = enemyGroup.get(
                enemyData.x,
                enemyData.y,
                "jacked-skeleton"
              );
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
        playerScene = playersData[gameInstance.playerId].scene;
        gameInstance.otherPlayers = otherPlayers;
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
          if (!playerData.online) {
            let otherPlayer = gameInstance.otherPlayers.get(playerId);
            if (otherPlayer) {
              otherPlayer.destroy(); // Remove sprite of other player
              gameInstance.otherPlayers.delete(playerId); // Remove other player from map
            }
            const playerName = gameInstance.playerNames.get(playerId);
            if (playerName) {
              playerName.destroy(); // Remove player name
              gameInstance.playerNames.delete(playerId); // Remove player name from map
            }
          }
          //console.log(playerScene,playerData.scene)
          let otherPlayer = gameInstance.otherPlayers.get(playerId);
          // if (playerData.scene == undefined) continue;
          if (playerData.scene != playerScene) continue;
          // console.log(playerData, playerScene);
          // Create or update other players
          if (!otherPlayer) {
            otherPlayer = gameInstance.add.sprite(
              playerData.x,
              playerData.y,
              "man"
            ); // Create a sprite for the other player
            gameInstance.otherPlayers.set(playerId, otherPlayer);
          }
          // console.log("OtherPlayer: ", otherPlayer);
          otherPlayer.x = playerData.x;
          otherPlayer.y = playerData.y;

          if (playerData.projectilesFromDB)
            otherPlayer.projectiles = gameInstance.projectiles;
          for (const projectileId in playerData.projectilesFromDB) {
            const projectileData = playerData.projectilesFromDB[projectileId];
            Player.prototype.throwProjectile(
              projectileData.direction,
              projectileData.x,
              projectileData.y,
              projectileData.attackObj,
              gameInstance,
              otherPlayer.projectiles
            );
          }

          // Play animation and set frame for other players
          if (playerData.anim && playerData.frame && otherPlayer.anims) {
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
      onValue(gameInstance.playerRef, (snapshot) => {
        const playerData = snapshot.val();
        if (playerData && playerData.exp) {
          gameInstance.exp = playerData.exp; // Update the player's exp value
        }
      });
    }
  });
};
