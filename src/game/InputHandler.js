class InputHandler {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickCallback = null;
        this.resizeCallback = null;
        this.keyCallback = null; 
        this.squares = null; 

        this.setupEventListeners();
    }

    setSquares(squares) {
        this.squares = squares;
    }

    setupEventListeners() {
        this.renderer.getDomElement().addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onMouseClick(event) {
        if (this.clickCallback && this.squares) {
            const clickedSquare = this.getClickedSquare(event, this.squares);
            this.clickCallback(clickedSquare, event);
        }
    }

    onWindowResize() {
        if (this.resizeCallback) {
            this.resizeCallback(window.innerWidth, window.innerHeight);
        }
    }

    onKeyDown(event) {
        if (this.keyCallback) {
            this.keyCallback(event);
        }
    }

    getClickedSquare(event, squares) {
        const rect = this.renderer.getDomElement().getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const allSquares = squares.flat();
        const intersects = this.raycaster.intersectObjects(allSquares);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    getClickedEdge(event, squares) {
        const rect = this.renderer.getDomElement().getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        

        const intersects = this.raycaster.intersectObjects(squares.flat());
        
        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const square = intersects[0].object;
      
            const worldX = intersectPoint.x;
            const worldZ = intersectPoint.z;
            const gridX = Math.round(worldX + 4);
            const gridY = Math.round(worldZ + 4);
            
          
            const squareX = square.userData.gridX;
            const squareY = square.userData.gridY;
            const offsetX = worldX - (squareX - 4);
            const offsetZ = worldZ - (squareY - 4);
          
            let edgeX = squareX;
            let edgeY = squareY;
            let orientation = null;
            
          
            if (Math.abs(offsetZ) > Math.abs(offsetX)) {
             
                orientation = 'horizontal';
                if (offsetZ > 0) {
                   
                    edgeY = squareY + 1;
                }
               
            } else {
               
                orientation = 'vertical';
                if (offsetX > 0) {
                    
                    edgeX = squareX + 1;
                }
               
            }
            
            return {
                gridX: edgeX,
                gridY: edgeY,
                orientation: orientation,
                square: square
            };
        }
        
        return null;
    }

    setClickCallback(callback) {
        this.clickCallback = callback;
    }

    setResizeCallback(callback) {
        this.resizeCallback = callback;
    }

    setKeyCallback(callback) {
        this.keyCallback = callback;
    }
}

export default InputHandler;