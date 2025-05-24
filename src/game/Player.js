class Player {
    constructor(kind, position) {
        this.kind = kind;
        this.position = { ...position };
        this.wallsLeft = 10;
    }
    getPosition() {
        return { ...this.position };
    }
     setPosition(x, y) {
        this.position = { x, y };
    }
     hasWallsLeft() {
        return this.wallsLeft > 0;
    }
     useWall() {
        if (this.wallsLeft > 0) {
            this.wallsLeft--;
            return true;
        }
        return false;
    }
     getWallsLeft() {
        return this.wallsLeft;
    }
}
 export default Player;