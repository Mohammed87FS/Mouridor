
class RendererManager {
    constructor(canvasId, options = {}) {
        const {
            antialias = true,
            clearColor = 0x000000,
            width = window.innerWidth,
            height = window.innerHeight
        } = options;

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById(canvasId),
            antialias
        });
        
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(clearColor);
    }

    getRenderer() {
        return this.renderer;
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    resize(width, height) {
        this.renderer.setSize(width, height);
    }

    getDomElement() {
        return this.renderer.domElement;
    }
}

export default RendererManager;