class Board {
    constructor(size) {
        this.size = size;
        this.walls = {
            horizontal: new Set(),
            vertical: new Set()
        };
    }

    isInsideBoard(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    isValidPosition(x, y) {
        return this.isInsideBoard(x, y);
    }

    addWall(x, y, orientation) {
        if (orientation === 'horizontal') {
            this.walls.horizontal.add(`${x},${y}`);
        } else if (orientation === 'vertical') {
            this.walls.vertical.add(`${x},${y}`);
        }
    }

    hasWall(x, y, orientation) {
        if (orientation === 'horizontal') {
            return this.walls.horizontal.has(`${x},${y}`);
        } else if (orientation === 'vertical') {
            return this.walls.vertical.has(`${x},${y}`);
        }
        return false;
    }

    getSize() {
        return this.size;
    }
}

export default Board;