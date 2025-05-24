class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particleSystems = [];
    }

    createMoveTrail(startPos, endPos, color) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            const t = i / particleCount;
            positions[i3] = startPos.x + (endPos.x - startPos.x) * t;
            positions[i3 + 1] = startPos.y + Math.random() * 0.5;
            positions[i3 + 2] = startPos.z + (endPos.z - startPos.z) * t;
            
          
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = Math.random() * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
     
        this.animateParticles(particles, velocities, 2000);
        
        return particles;
    }

    createWallPlacementEffect(position, orientation) {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
         
            if (orientation === 'horizontal') {
                positions[i3] = position.x + (Math.random() - 0.5) * 1.0;
                positions[i3 + 1] = position.y + Math.random() * 0.8;
                positions[i3 + 2] = position.z + (Math.random() - 0.5) * 0.1;
            } else {
                positions[i3] = position.x + (Math.random() - 0.5) * 0.1;
                positions[i3 + 1] = position.y + Math.random() * 0.8;
                positions[i3 + 2] = position.z + (Math.random() - 0.5) * 1.0;
            }
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.03,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
  
        this.createBurstEffect(particles, 1500);
        
        return particles;
    }

    animateParticles(particles, velocities, duration) {
        const startTime = Date.now();
        const positions = particles.geometry.attributes.position.array;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = 1 - progress;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    createBurstEffect(particles, duration) {
        const startTime = Date.now();
        const positions = particles.geometry.attributes.position.array;
        const originalPositions = positions.slice();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress >= 1) {
                this.scene.remove(particles);
                return;
            }
            
            const scale = 1 + progress * 2;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = originalPositions[i] * scale;
                positions[i + 1] = originalPositions[i + 1] + progress * 0.5;
                positions[i + 2] = originalPositions[i + 2] * scale;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = 1 - progress;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

export default ParticleSystem;