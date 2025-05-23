import Board from './Board.js'
import HumanPlayer from './Human.js'
import AI from './AI.js'


const GameState = {
    PLAYING: 'playing',
    WON: 'won',
    DRAW: 'draw'
};

class Game {
    constructor() {

        this.board = new Board(9)
        this.human = new HumanPlayer("Human", { x: 4, y: 0 })
        this.ai = new AI("AI", { x: 4, y: 8 })
        this.currentPlayer = this.human; // ill change that later to be based on who wants to start first
        this.state = GameState.PLAYING;
        this.moveHistory = []

    }

    start() {
        console.log("Game started !")
    }

    switchTurns() {
        if (this.currentPlayer === this.human) {

            this.currentPlayer = this.ai
        } else {

            this.currentPlayer = this.human
        }
    };

    makeMove(toX, toY) {

        if (!this.isValidMove(toX, toY)) {
            console.log("Invalid move!");
            return;
        }
        this.currentPlayer.position = { x: toX, y: toY }
        console.log(`${this.currentPlayer.kind} move to ${toX}, ${toY}`);

        const historyData = {
            player: this.currentPlayer.kind,
            position: { x: toX, y: toY }
        };

        this.moveHistory.push(historyData)


        if (this.checkWin()) {
            console.log(`${this.currentPlayer.kind} won !`)
            return;
        }

        this.switchTurns();

        if (this.currentPlayer === this.ai) {
            this.makeAIMove();
        }
    }
    checkWin() {
        if (this.human.position.y === 8) {
            this.state = GameState.WON;
            return true;
        }

        if (this.ai.position.y === 0) {
            this.state = GameState.WON;
            return true;
        }

        return false;
    }
    makeAIMove() {
        const currentY = this.ai.position.y;
        const currentX = this.ai.position.x;

        // What if this move is invalid?
        if (this.isValidMove(currentX, currentY - 1)) {
            this.makeMove(currentX, currentY - 1);
        } else {
            // AI needs to try a different direction!
            console.log("AI can't move down, trying sideways...");
        }
    }
    isValidMove(toX, toY) {

        if (!this.board.isInsideBoard(toX, toY)) {

            return false
        }

        const otherPlayer = this.currentPlayer === this.human ? this.ai : this.human;

        if (otherPlayer.position.x === toX && otherPlayer.position.y === toY) {
            return false;

        }

        const fromX = this.currentPlayer.position.x;
        const fromY = this.currentPlayer.position.y;

        const dx = Math.abs(toX - fromX)
        const dy = Math.abs(toY - fromY)

        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            return false;
        }

        return true;
    }



}

export default Game;