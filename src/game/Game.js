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
        this.human = new HumanPlayer("Human", { x: 4, y: 8 }) 
        this.ai = new AI("AI", { x: 4, y: 0 })               
        this.currentPlayer = this.human;
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
            return false;
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
            return true;
        }

        this.switchTurns();


        return true;
    }
    isGameOver() {
        return this.state === GameState.WON || this.state === GameState.DRAW;
    }
    checkWin() {
       
        if (this.human.position.y === 0) {
            this.state = GameState.WON;
            return true;
        }

  
        if (this.ai.position.y === 8) {
            this.state = GameState.WON;
            return true;
        }

        return false;
    }

    makeAIMove() {
        const currentY = this.ai.position.y;
        const currentX = this.ai.position.x;

        if (this.isValidMove(currentX, currentY + 1)) {
            this.ai.position = { x: currentX, y: currentY + 1 };
            console.log(`${this.ai.kind} move to ${currentX}, ${currentY + 1}`);
            this.switchTurns();
            return true;
        }

        else if (this.isValidMove(currentX - 1, currentY)) {
            this.ai.position = { x: currentX - 1, y: currentY };
            console.log(`${this.ai.kind} move to ${currentX - 1}, ${currentY}`);
            this.switchTurns();
            return true;
        }

        else if (this.isValidMove(currentX + 1, currentY)) {
            this.ai.position = { x: currentX + 1, y: currentY };
            console.log(`${this.ai.kind} move to ${currentX + 1}, ${currentY}`);
            this.switchTurns();
            return true;
        }

        else if (this.isValidMove(currentX, currentY - 1)) {
            this.ai.position = { x: currentX, y: currentY - 1 };
            console.log(`${this.ai.kind} move to ${currentX}, ${currentY - 1}`);
            this.switchTurns();
            return true;
        }

        console.log("AI can't move anywhere!");
        return false;
    }


    isValidMove(toX, toY) {
        console.log(`Checking move from (${this.currentPlayer.position.x}, ${this.currentPlayer.position.y}) to (${toX}, ${toY})`);

        if (!this.board.isInsideBoard(toX, toY)) {
            console.log("Move invalid: outside board");
            return false;
        }

        const otherPlayer = this.currentPlayer === this.human ? this.ai : this.human;
        console.log(`Other player is at (${otherPlayer.position.x}, ${otherPlayer.position.y})`);

        if (otherPlayer.position.x === toX && otherPlayer.position.y === toY) {
            console.log("Move invalid: space occupied by other player");
            return false;
        }

        const fromX = this.currentPlayer.position.x;
        const fromY = this.currentPlayer.position.y;

        const dx = Math.abs(toX - fromX);
        const dy = Math.abs(toY - fromY);
        console.log(`Distance: dx=${dx}, dy=${dy}`);

        if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
            console.log("Move invalid: not adjacent");
            return false;
        }

        console.log("Move is valid!");
        return true;
    }




}

export default Game;