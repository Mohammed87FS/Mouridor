import Board from './Board.js';
import HumanPlayer from './Human.js';
import AI from './AI.js';

const GameState = {
    PLAYING: 'playing',
    WON: 'won',
    DRAW: 'draw'
};

class Game {
    constructor() {
        this.board = new Board(9);
        this.human = new HumanPlayer("Human", { x: 4, y: 8 });
        this.ai = new AI("AI", { x: 4, y: 0 });
        this.currentPlayer = this.human;
        this.state = GameState.PLAYING;
        this.moveHistory = [];
         this.wallCreationCallback = null;
    }
  // NEW: Set callback for creating visual walls
    setWallCreationCallback(callback) {
        this.wallCreationCallback = callback;
    }
    start() {
        console.log("Game started!");
        this.state = GameState.PLAYING;
    }

    makeMove(toX, toY) {
        if (!this.isValidMove(toX, toY)) {
            console.log("Invalid move!");
            return false;
        }

        this.currentPlayer.position = { x: toX, y: toY };
        console.log(`${this.currentPlayer.kind} moved to (${toX}, ${toY})`);

        this.recordMove(toX, toY);

        if (this.checkWin()) {
            this.state = GameState.WON;
            console.log(`${this.currentPlayer.kind} won!`);
            return true;
        }

        this.switchTurns();
        return true;
    }

    makeAIMove() {
        if (this.currentPlayer !== this.ai) {
            console.warn("makeAIMove called when it's not AI's turn");
            return false;
        }

         return this.ai.makeMove(this);
    }

  
   isValidMove(toX, toY) {
    
        if (!this.board.isInsideBoard(toX, toY)) {
            return false;
        }

       
        if (this.isPositionOccupied(toX, toY)) {
            return false;
        }

   
        if (!this.isAdjacentMove(toX, toY)) {
            return false;
        }

      
        const { x: fromX, y: fromY } = this.currentPlayer.position;
        if (this.board.isMovementBlocked(fromX, fromY, toX, toY)) {
            return false;
        }

        return true;
    }

    isPositionOccupied(x, y) {
        const otherPlayer = this.currentPlayer === this.human ? this.ai : this.human;
        return otherPlayer.position.x === x && otherPlayer.position.y === y;
    }

    isAdjacentMove(toX, toY) {
        const { x: fromX, y: fromY } = this.currentPlayer.position;
        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    }

    checkWin() {
        if (this.human.position.y === 0) {
            return true;
        }
        
        if (this.ai.position.y === 8) {
            return true;
        }
        
        return false;
    }

    switchTurns() {
        this.currentPlayer = this.currentPlayer === this.human ? this.ai : this.human;
    }

     placeWall(x, y, orientation) {
        console.log(`Attempting to place ${orientation} wall at (${x},${y})`);
        console.log(`Current player: ${this.currentPlayer.kind}, walls left: ${this.currentPlayer.getWallsLeft()}`);
        
      
        if (!this.currentPlayer.hasWallsLeft()) {
            console.log("No walls left!");
            return false;
        }

    
        if (!this.board.isValidWallPlacement(x, y, orientation)) {
            console.log("Invalid wall placement!");
            return false;
        }

   
        this.board.addWall(x, y, orientation);
        this.currentPlayer.useWall();
        
        console.log(`${this.currentPlayer.kind} placed ${orientation} wall at (${x}, ${y}). Walls left: ${this.currentPlayer.getWallsLeft()}`);
        
     
        if (this.wallCreationCallback) {
            this.wallCreationCallback(x, y, orientation);
        }
        
   
        this.board.debugWalls();
        
    
        this.switchTurns();
        return true;
    }

    isGameOver() {
        return this.state === GameState.WON || this.state === GameState.DRAW;
    }

    recordMove(x, y) {
        this.moveHistory.push({
            player: this.currentPlayer.kind,
            position: { x, y },
            timestamp: Date.now()
        });
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getGameState() {
        return this.state;
    }
}

export default Game;