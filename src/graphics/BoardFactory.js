class BoardFactory {
    constructor(config = {}) {
        this.boardSize = config.boardSize || 9;
        this.squareSize = config.squareSize || 0.95;
        this.colors = config.colors || {
            light: 0x8B4513,
            dark: 0xA0522D
        };
    }

    createBoard() {
        const squares = [];

        for (let x = 0; x < this.boardSize; x++) {
            squares[x] = [];
            for (let y = 0; y < this.boardSize; y++) {
                const square = this.createSquare(x, y);
                squares[x][y] = square;
            }
        }

        return squares;
    }

    createSquare(x, y) {
        const geometry = new THREE.BoxGeometry(this.squareSize, 0.1, this.squareSize);
        const color = (x + y) % 2 === 0 ? this.colors.light : this.colors.dark;
        const material = new THREE.MeshBasicMaterial({ color });

        const square = new THREE.Mesh(geometry, material);
        square.position.set(x - 4, 0, y - 4);
        square.userData = { gridX: x, gridY: y };

        return square;
    }
}

export default BoardFactory;