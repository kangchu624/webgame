// Get references to HTML elements
const gameMenu = document.getElementById('gameMenu');
const gameContainer = document.getElementById('gameContainer');
const gameCanvas = document.getElementById('gameCanvas');

// Import game functions
import { startSpaceGame, resetSpaceGame } from './spaceShooter.js';
import { startNewGame } from './newGame.js';

// Create game menu buttons dynamically
const games = [
  { name: 'Space Shooter', startFunction: startSpaceGame },
  { name: 'Bouncing Ball', startFunction: startNewGame }
];

games.forEach(game => {
  const button = document.createElement('button');
  button.textContent = game.name;
  button.addEventListener('click', () => {
    hideGameMenu();
    showGameCanvas();
    game.startFunction();
  });
  gameMenu.appendChild(button);
});

// Function to show the game menu
function showGameMenu() {
  gameMenu.style.display = 'block';
}

// Function to hide the game menu
function hideGameMenu() {
  gameMenu.style.display = 'none';
}

// Function to show the game canvas
function showGameCanvas() {
  gameContainer.style.display = 'flex';
}

// Initially show the game menu
showGameMenu();

// Export showGameMenu 
export { showGameMenu }; 