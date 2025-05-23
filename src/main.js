

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.BoxGeometry(9, 0.2, 9);

const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.set(0, 10, 10);  
camera.lookAt(0, 0, 0);  

const gridHelper = new THREE.GridHelper(9, 9, 0x000000, 0x444444);
gridHelper.position.y = 0.11; 
scene.add(gridHelper);

renderer.render(scene, camera);