import Board from './Board'
import HumanPlayer from './Human'
import AI from './AI'


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
        if (this.currentPlayer == this.human) {

            this.currentPlayer = this.ai
        } else {

            this.currentPlayer = this.human
        }
    };
    
    
}