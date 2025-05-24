import SceneManager from './Scene.js'; 
import MaterialFactory from './MaterialFactory.js';  
import ParticleSystem from './ParticleSystem.js';


class EnhancedScene extends SceneManager {
    constructor() {
        super();
        this.setupLighting();
        this.setupEnvironment();
        this.materialFactory = new MaterialFactory();
        this.particleSystem = new ParticleSystem(this.scene);
    }

    setupLighting() {
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

      
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        
        const light1 = new THREE.PointLight(0x4facfe, 0.6, 20);
        light1.position.set(-5, 5, 5);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xfa709a, 0.6, 20);
        light2.position.set(5, 5, -5);
        this.scene.add(light2);

      
        this.animateLight(light1);
        this.animateLight(light2);
    }

    animateLight(light) {
        const startTime = Date.now();
        const originalIntensity = light.intensity;
        
        const animate = () => {
            const time = (Date.now() - startTime) * 0.001;
            light.intensity = originalIntensity + Math.sin(time) * 0.2;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    setupEnvironment() {
        
        this.createStarField();
        
    
        this.scene.fog = new THREE.Fog(0x000000, 10, 100);
      
        this.createAnimatedBackground();
    }

    createStarField() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.6
        });

        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);

        const animate = () => {
            starField.rotation.y += 0.0002;
            requestAnimationFrame(animate);
        };
        animate();
    }

    createAnimatedBackground() {
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x1a1a2e) },
                color2: { value: new THREE.Color(0x16213e) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                    vec2 uv = vUv;
                    float wave = sin(uv.x * 10.0 + time) * 0.1;
                    vec3 color = mix(color1, color2, uv.y + wave);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const backgroundSphere = new THREE.Mesh(geometry, material);
        this.scene.add(backgroundSphere);

   
        const animate = () => {
            material.uniforms.time.value += 0.01;
            requestAnimationFrame(animate);
        };
        animate();
    }


    createEnhancedPawn(color, isHuman = true) {
        const group = new THREE.Group();
        
  
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
        const material = this.materialFactory.createGlowingPawnMaterial(color, true);
        const pawn = new THREE.Mesh(geometry, material);
        pawn.position.y = 0.35;
        pawn.castShadow = true;
        group.add(pawn);

        
        const glowGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.35;
        group.add(glow);

  
        this.addPawnParticles(group, color);

        return group;
    }

    addPawnParticles(pawnGroup, color) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 0.5 + Math.random() * 0.3;
            const angle = (i / particleCount) * Math.PI * 2;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = Math.random() * 0.8 + 0.2;
            positions[i3 + 2] = Math.sin(angle) * radius;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        pawnGroup.add(particles);

        const animate = () => {
            particles.rotation.y += 0.01;
            particles.rotation.x += 0.005;
            requestAnimationFrame(animate);
        };
        animate();
    }


    createMoveEffect(startPos, endPos, color) {
        return this.particleSystem.createMoveTrail(startPos, endPos, color);
    }


    createWallEffect(position, orientation) {
        return this.particleSystem.createWallPlacementEffect(position, orientation);
    }
}

export default EnhancedScene;