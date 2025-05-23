import Player from './Player.js';

class Board {

    constructor(size) {
        this.size = size;
    }

    // init() { };

    isInsideBoard(x, y) {
        return (x >= 0 && x <= this.size - 1) && (y >= 0 && y <= this.size - 1)

    }

//     getPawnPosition(pawn){
//    pawn.position
    
//     }


}
export default Board

