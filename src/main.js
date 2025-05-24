import Game from './game/Game.js';


const BOARD_SIZE = 9;
const SQUARE_SIZE = 0.95;
const PAWN_HEIGHT = 0.5;
const PAWN_RADIUS = 0.3;
const PAWN_Y_POSITION = 0.35;

const COLORS = {
    HUMAN_PAWN: 0x0000ff,
    AI_PAWN: 0xff0000,
    SQUARE_LIGHT: 0x8B4513,
    SQUARE_DARK: 0xA0522D,
    HIGHLIGHT: 0x0fff0
};

const CAMERA_CONFIG = {
    fov: 50,
    position: { x: 0, y: 10, z: 10 },
    lookAt: { x: 0, y: 0, z: 0 }
};


const game = new Game();
let scene, camera, renderer, raycaster, mouse;
let squares = [];
let humanPawn, aiPawn;


function initGame() {
    game.start();
    initThreeJS();
    createBoard();
    createPawns();
    setupEventListeners();
    updatePawnPositions();
    animate();
}

function initThreeJS() {

    scene = new THREE.Scene();


    camera = new THREE.PerspectiveCamera(
        CAMERA_CONFIG.fov,
        window.innerWidth / window.innerHeight
    );
    camera.position.set(
        CAMERA_CONFIG.position.x,
        CAMERA_CONFIG.position.y,
        CAMERA_CONFIG.position.z
    );
    camera.lookAt(
        CAMERA_CONFIG.lookAt.x,
        CAMERA_CONFIG.lookAt.y,
        CAMERA_CONFIG.lookAt.z
    );


    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('gameCanvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);


    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
}

function createBoard() {
    squares = [];

    for (let x = 0; x < BOARD_SIZE; x++) {
        squares[x] = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            const square = createSquare(x, y);
            squares[x][y] = square;
            scene.add(square);
        }
    }
}

function createSquare(x, y) {
    const geometry = new THREE.BoxGeometry(SQUARE_SIZE, 0.1, SQUARE_SIZE);
    const color = (x + y) % 2 === 0 ? COLORS.SQUARE_LIGHT : COLORS.SQUARE_DARK;
    const material = new THREE.MeshBasicMaterial({ color });

    const square = new THREE.Mesh(geometry, material);
    square.position.set(x - 4, 0, y - 4);
    square.userData = { gridX: x, gridY: y };

    return square;
}

function createPawns() {

    const humanGeometry = new THREE.CylinderGeometry(PAWN_RADIUS, PAWN_RADIUS, PAWN_HEIGHT, 16);
    const humanMaterial = new THREE.MeshBasicMaterial({ color: COLORS.HUMAN_PAWN });
    humanPawn = new THREE.Mesh(humanGeometry, humanMaterial);
    humanPawn.position.y = PAWN_Y_POSITION;
    scene.add(humanPawn);


    const aiGeometry = new THREE.CylinderGeometry(PAWN_RADIUS, PAWN_RADIUS, PAWN_HEIGHT, 16);
    const aiMaterial = new THREE.MeshBasicMaterial({ color: COLORS.AI_PAWN });
    aiPawn = new THREE.Mesh(aiGeometry, aiMaterial);
    aiPawn.position.y = PAWN_Y_POSITION;
    scene.add(aiPawn);
}

function updatePawnPositions() {

    humanPawn.position.x = game.human.position.x - 4;
    humanPawn.position.z = game.human.position.y - 4;

    aiPawn.position.x = game.ai.position.x - 4;
    aiPawn.position.z = game.ai.position.y - 4;
}

function setupEventListeners() {
    renderer.domElement.addEventListener('click', onMouseClick);
    window.addEventListener('resize', onWindowResize);
}

function onMouseClick(event) {
    if (game.getCurrentPlayer() !== game.human) {
        console.log("Not human's turn!");
        return;
    }

    const clickedSquare = getClickedSquare(event);
    if (!clickedSquare) return;

    const { gridX, gridY } = clickedSquare.userData;


    highlightSquare(clickedSquare);


    const moveSuccess = game.makeMove(gridX, gridY);

    if (moveSuccess) {
        updatePawnPositions();


        if (!game.isGameOver() && game.getCurrentPlayer() === game.ai) {
            setTimeout(() => {
                game.makeAIMove();
                updatePawnPositions();
            }, 500);
        }
    }
}

function getClickedSquare(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allSquares = squares.flat();
    const intersects = raycaster.intersectObjects(allSquares);

    return intersects.length > 0 ? intersects[0].object : null;
}

function highlightSquare(square) {
    const originalColor = square.material.color.getHex();
    square.material.color.setHex(COLORS.HIGHLIGHT);

    setTimeout(() => {
        square.material.color.setHex(originalColor);
    }, 200);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

initGame();