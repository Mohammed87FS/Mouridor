
class PawnFactory {
    constructor(config = {}) {
        this.radius = config.radius || 0.3;
        this.height = config.height || 0.5;
        this.yPosition = config.yPosition || 0.35;
        this.colors = config.colors || {
            human: 0x0000ff,
            ai: 0xff0000
        };
    }

    createHumanPawn() {
        return this.createPawn(this.colors.human);
    }

    createAIPawn() {
        return this.createPawn(this.colors.ai);
    }

    createPawn(color) {
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16);
        const material = new THREE.MeshBasicMaterial({ color });
        const pawn = new THREE.Mesh(geometry, material);
        pawn.position.y = this.yPosition;
        return pawn;
    }
}

export default PawnFactory;