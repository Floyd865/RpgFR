import Phaser from 'phaser';
import ExplorationScene from './scenes/ExplorationScene.js';
import CombatScene from './scenes/CombatScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import DialogueScene from './scenes/DialogueScene.js';
import QuestBoardScene from './scenes/QuestBoardScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true // Affiche les hitboxes pour le débogage
    }
  },
  scene: [MainMenuScene, ExplorationScene, CombatScene, InventoryScene, DialogueScene, QuestBoardScene]
};

new Phaser.Game(config);