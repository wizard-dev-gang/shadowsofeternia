import React, { useEffect } from "react";
import Phaser from "phaser";
import Game from "../scenes/Game";
import Preloader from "../scenes/Preloader";
import PlayerUI from "../scenes/PlayerUI";

function GameComponent() {
  const phaserGameRef = React.useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Check if the Phaser game instance already exists
    if (phaserGameRef.current) {
      return;
    }
    // Create a new Phaser game instance
    phaserGameRef.current = new Phaser.Game({
      type: Phaser.AUTO, // The renderer type (auto-detected)
      parent: "game-content", // The ID or element where the game canvas will be appended
      width: 500,
      height: 400,
      physics: {
        default: "arcade", // The default physics system
        arcade: {
          gravity: { y: 0 }, // The gravity configuration (no gravity in this case)
          debug: true, // Enable physics debugging (collider outlines, etc.)
        },
      },
      scene: [Preloader, Game, PlayerUI], // The array of scene classes to be included in the game
      scale: {
        zoom: 2,
      },
    });
  }, []);

  return (
    <div
      id="game-content"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    ></div>
  );
}

export default GameComponent;
