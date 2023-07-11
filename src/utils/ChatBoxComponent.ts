import Phaser from "phaser";

export class ChatBoxComponent {
    constructor(scene) {
      this.scene = scene;
      this.isVisible = false;
      // Create and position the chat box UI elements here
      // ...
    }
  
    show() {
      if (!this.isVisible) {
        // Show the chat box UI elements here
        // ...
        this.isVisible = true;
      }
    }
  
    hide() {
      if (this.isVisible) {
        // Hide the chat box UI elements here
        // ...
        this.isVisible = false;
      }
    }
}