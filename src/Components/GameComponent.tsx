import React, { useEffect } from "react";
import Phaser from "phaser";
import Game from "../scenes/Game";
import Forest from '../scenes/Forest';
import Preloader from "../scenes/Preloader";
import PlayerUI from "../scenes/PlayerUI";
import ChooseCharacterScene from "../scenes/ChooseCharacter";
import Ruins from "../scenes/Ruins";
import BossMap from "../scenes/BossMap";
import Credits from "../scenes/EndCredits";

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
      width: 400,
      height: 300,
      physics: {
        default: "arcade", // The default physics system
        arcade: {
          gravity: { y: 0 }, // The gravity configuration (no gravity in this case)
          debug: false, // Enable physics debugging (collider outlines, etc.)
        },
      }, 
      
      scene: [Preloader, ChooseCharacterScene, Game, Forest, Ruins, BossMap, Credits, PlayerUI],

      scale: {
        zoom: 2.5,
      },
    });
  }, []);

  return (
    <div
      id="game-content"
      style={{
        display: "flex",
        justifyContent: "center",
        // alignItems: "center",
        height: "100vh",
        marginTop: "300px",
      }}
    ></div>
  );
}
export default GameComponent;
