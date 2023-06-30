import React, { useEffect } from "react";
import Phaser from "phaser";
import Game from "../scenes/Game";
import Preloader from "../scenes/Preloader";

function GameComponent() {
  const phaserGameRef = React.useRef(null);

  useEffect(() => {
    if (phaserGameRef.current) {
      return;
    }
    phaserGameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-content",
      width: 950,
      height: 465,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [Preloader, Game],
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
