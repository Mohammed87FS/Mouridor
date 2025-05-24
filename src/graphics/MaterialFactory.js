class MaterialFactory {
    constructor() {
        this.clock = new THREE.Clock();
        this.animationMixers = [];
    }


    createGlowingPawnMaterial(color, isActive = false) {
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: isActive ? color : 0x000000,
            emissiveIntensity: isActive ? 0.3 : 0.1,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        if (isActive) {
            this.addPulseEffect(material);
        }
        
        return material;
    }

 
    createAnimatedBoardMaterial(baseColor, isHighlighted = false) {
        const material = new THREE.MeshPhongMaterial({
            color: baseColor,
            transparent: true,
            opacity: isHighlighted ? 0.8 : 0.95
        });

        if (isHighlighted) {
            this.addRippleEffect(material);
        }

        return material;
    }

 
    createHolographicWallMaterial(color) {
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            emissive: color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide
        });

        this.addHologramEffect(material);
        return material;
    }

    addPulseEffect(material) {
        const startTime = this.clock.getElapsedTime();
        const originalIntensity = material.emissiveIntensity;
        
        const animate = () => {
            const time = this.clock.getElapsedTime() - startTime;
            material.emissiveIntensity = originalIntensity + Math.sin(time * 3) * 0.2;
            requestAnimationFrame(animate);
        };
        animate();
    }

    addRippleEffect(material) {
      
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const time = this.clock.getElapsedTime() - startTime;
            const wave = Math.sin(time * 4) * 0.5 + 0.5;
            material.opacity = 0.6 + wave * 0.3;
            requestAnimationFrame(animate);
        };
        animate();
    }

    addHologramEffect(material) {
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const time = this.clock.getElapsedTime() - startTime;
            material.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
            material.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;
            requestAnimationFrame(animate);
        };
        animate();
    }
}

export default MaterialFactory;