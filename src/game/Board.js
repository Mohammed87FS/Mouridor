class Board {

    constructor(size) {
        this.size = size;
    }

    init() { };

    isInsideBoard(x,y){
        if((x>=0 && x<=this.size-1)&&((y>=0 && y<=this.size-1)))
        
        return "you are within boundries"
    }

}

const board = new Board(9)

console.log(board.isInsideBoard(1,5));
console.log(board.isInsideBoard(20,4))