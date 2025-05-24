class InputHandler {
    constructor(renderer, camera) {
        this.renderer = renderer;
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickCallback = null;
        this.resizeCallback = null;
        this.squares = null; 

        this.setupEventListeners();
    }

   
    setSquares(squares) {
        this.squares = squares;
    }

    setupEventListeners() {
        this.renderer.getDomElement().addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
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

    getClickedSquare(event, squares) {
        const rect = this.renderer.getDomElement().getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const allSquares = squares.flat();
        const intersects = this.raycaster.intersectObjects(allSquares);

        return intersects.length > 0 ? intersects[0].object : null;
    }

    setClickCallback(callback) {
        this.clickCallback = callback;
    }

    setResizeCallback(callback) {
        this.resizeCallback = callback;
    }
}

export default InputHandler;