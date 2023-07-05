import React, { useEffect } from "react";
import Phaser from "phaser";
import Game from "../scenes/Game";
import Preloader from "../scenes/Preloader";
import PlayerUI from "../scenes/PlayerUI";

function GameComponent() {
  const phaserGameRef = React.useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (phaserGameRef.current) {
      return;
    }
    phaserGameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-content",
      width: 500,
      height: 400,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [Preloader, Game, PlayerUI],
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
