
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.squares = [];
        this.humanPawn = null;
        this.aiPawn = null;
    }

    getScene() {
        return this.scene;
    }

    addToScene(object) {
        this.scene.add(object);
    }

    removeFromScene(object) {
        this.scene.remove(object);
    }

    setSquares(squares) {
        this.squares = squares;
    }

    getSquares() {
        return this.squares;
    }

    setPawns(humanPawn, aiPawn) {
        this.humanPawn = humanPawn;
        this.aiPawn = aiPawn;
    }

    getPawns() {
        return { human: this.humanPawn, ai: this.aiPawn };
    }
}

export default SceneManager;