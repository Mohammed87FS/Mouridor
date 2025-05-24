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

        const { x: currentX, y: currentY } = this.ai.position;
        
        const moves = [
            { x: currentX, y: currentY + 1 }, 
            { x: currentX - 1, y: currentY },
            { x: currentX + 1, y: currentY }, 
            { x: currentX, y: currentY - 1 }  
        ];

        for (const move of moves) {
            if (this.isValidMove(move.x, move.y)) {
                return this.makeMove(move.x, move.y);
            }
        }

        console.log("AI can't move anywhere!");
        return false;
    }

    // FIXED: Single isValidMove method with wall checking
    isValidMove(toX, toY) {
        // Check bounds
        if (!this.board.isInsideBoard(toX, toY)) {
            return false;
        }

        // Check if position is occupied
        if (this.isPositionOccupied(toX, toY)) {
            return false;
        }

        // Check if move is adjacent
        if (!this.isAdjacentMove(toX, toY)) {
            return false;
        }

        // Check if movement is blocked by walls
        const { x: fromX, y: fromY } = this.currentPlayer.position;
        if (this.board.isMovementBlocked(fromX, fromY, toX, toY)) {
            console.log("Move blocked by wall!");
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
        
        // Check if player has walls left
        if (!this.currentPlayer.hasWallsLeft()) {
            console.log("No walls left!");
            return false;
        }

        // Check if wall placement is valid
        if (!this.board.isValidWallPlacement(x, y, orientation)) {
            console.log("Invalid wall placement!");
            return false;
        }

        // Place the wall
        this.board.addWall(x, y, orientation);
        this.currentPlayer.useWall();
        
        console.log(`${this.currentPlayer.kind} placed ${orientation} wall at (${x}, ${y}). Walls left: ${this.currentPlayer.getWallsLeft()}`);
        
        // Debug: show all walls
        this.board.debugWalls();
        
        // Switch turns after placing wall
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