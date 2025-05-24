class GameController {
    constructor(game, sceneManager, colors) {
        this.game = game;
        this.sceneManager = sceneManager;
        this.colors = colors;
    }
     handleSquareClick(clickedSquare) {
        if (!clickedSquare) return false;
        if (this.game.getCurrentPlayer() !== this.game.human) {
            console.log("Not human's turn!");
            return false;
        }
         const { gridX, gridY } = clickedSquare.userData;
         this.highlightSquare(clickedSquare);
         const moveSuccess = this.game.makeMove(gridX, gridY);
         if (moveSuccess) {
            this.updatePawnPositions();
            return true; 
        }
         return false;
    }
     updatePawnPositions() {
        const pawns = this.sceneManager.getPawns();
         pawns.human.position.x = this.game.human.position.x - 4;
        pawns.human.position.z = this.game.human.position.y - 4;
         pawns.ai.position.x = this.game.ai.position.x - 4;
        pawns.ai.position.z = this.game.ai.position.y - 4;
    }
     highlightSquare(square) {
        const originalColor = square.material.color.getHex();
        square.material.color.setHex(this.colors.highlight);
         setTimeout(() => {
            square.material.color.setHex(originalColor);
        }, 200);
    }
}
 export default GameController;