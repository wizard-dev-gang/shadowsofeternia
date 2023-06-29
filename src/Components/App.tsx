// function App() {
//   return (
//     <div>
//       <h1 className="text-6xl font-extrabold text-indigo-800">
//         This is a sample text to show the website is running and Tailwind is
//         working.
//       </h1>
//     </div>
//   );
// }

// export default App;

import Phaser from 'phaser';
import Preloader from '../scenes/Preloader';
import Game from '../scenes/Game';


export default new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-content',
  width: 400,
  height: 250,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 0},

    }
  },
  scene: [Preloader, Game],
  scale: {
    zoom: 2
  }
})
