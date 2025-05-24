

class CameraManager {
    constructor(config = {}) {
        const {
            fov = 75,
            aspect = window.innerWidth / window.innerHeight,
            position = { x: 0, y: 10, z: 10 },
            lookAt = { x: 0, y: 0, z: 0 }
        } = config;

        this.camera = new THREE.PerspectiveCamera(fov, aspect);
        this.camera.position.set(position.x, position.y, position.z);
        this.camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
    }

    getCamera() {
        return this.camera;
    }

    updateAspect(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    setPosition(x, y, z) {
        this.camera.position.set(x, y, z);
    }

    lookAt(x, y, z) {
        this.camera.lookAt(x, y, z);
    }
}

export default CameraManager;