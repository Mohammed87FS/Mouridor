class WallFactory {
    constructor(config = {}) {
        this.color = config.color || 0x8B4513;
        this.thickness = config.thickness || 0.1;
        this.height = config.height || 0.3;
        this.length = config.length || 1.0;
    }

    createHorizontalWall(x, y) {
        const geometry = new THREE.BoxGeometry(this.length, this.height, this.thickness);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        const wall = new THREE.Mesh(geometry, material);
        
    
        wall.position.set(x - 4, this.height / 2, y - 4.5);
        wall.userData = { 
            type: 'wall',
            orientation: 'horizontal',
            gridX: x,
            gridY: y
        };
        
        return wall;
    }

    createVerticalWall(x, y) {
        const geometry = new THREE.BoxGeometry(this.thickness, this.height, this.length);
        const material = new THREE.MeshBasicMaterial({ color: this.color });
        const wall = new THREE.Mesh(geometry, material);
        
        
        wall.position.set(x - 4.5, this.height / 2, y - 4);
        wall.userData = { 
            type: 'wall',
            orientation: 'vertical',
            gridX: x,
            gridY: y
        };
        
        return wall;
    }
}

export default WallFactory;