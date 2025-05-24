import Game from './game/Game.js';

const game = new Game();
game.start();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

const squares = [];
const squareSize = 0.95;

for (let x = 0; x < 9; x++) {
    squares[x] = [];
    for (let y = 0; y < 9; y++) {
        const squareGeometry = new THREE.BoxGeometry(squareSize, 0.1, squareSize);
        const squareMaterial = new THREE.MeshBasicMaterial({
            color: (x + y) % 2 === 0 ? 0x8B4513 : 0xA0522D
        });
        const square = new THREE.Mesh(squareGeometry, squareMaterial);

        square.position.set(x - 4, 0, y - 4);
        square.userData = { gridX: x, gridY: y };

        scene.add(square);
        squares[x][y] = square;
    }
}

const humanGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
const humanMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const humanPawn = new THREE.Mesh(humanGeometry, humanMaterial);
humanPawn.position.set(0, 0.35, -4);
scene.add(humanPawn);

const aiGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16);
const aiMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const aiPawn = new THREE.Mesh(aiGeometry, aiMaterial);
aiPawn.position.set(0, 0.35, 4);
scene.add(aiPawn);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updatePawnPositions() {
    humanPawn.position.x = game.human.position.x - 4;
    humanPawn.position.z = game.human.position.y - 4;

    aiPawn.position.x = game.ai.position.x - 4;
    aiPawn.position.z = game.ai.position.y - 4;
}

function onMouseClick(event) {
    console.log("Mouse clicked!");


    if (game.currentPlayer !== game.human) {
        console.log("Not human's turn!");
        return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allSquares = [];
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            allSquares.push(squares[x][y]);
        }
    }

    const intersects = raycaster.intersectObjects(allSquares);

    if (intersects.length > 0) {
        const clickedSquare = intersects[0].object;
        const gridX = clickedSquare.userData.gridX;
        const gridY = clickedSquare.userData.gridY;

        console.log(`Clicked on square: (${gridX}, ${gridY})`);
        console.log(`Human is at: (${game.human.position.x}, ${game.human.position.y})`);

        const dx = Math.abs(gridX - game.human.position.x);
        const dy = Math.abs(gridY - game.human.position.y);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        console.log(`Distance: dx=${dx}, dy=${dy}, Adjacent: ${isAdjacent}`);

        const originalColor = clickedSquare.material.color.getHex();
        clickedSquare.material.color.setHex(0x00ff00);
        setTimeout(() => {
            clickedSquare.material.color.setHex(originalColor);
        }, 200);

        const moveSuccess = game.makeMove(gridX, gridY);
        console.log("Move success:", moveSuccess);

        if (moveSuccess) {
            updatePawnPositions();
            setTimeout(() => {
                if (!game.isGameOver() && game.currentPlayer === game.ai) {
                    game.makeAIMove();
                    updatePawnPositions();
                }
            }, 500);
        }
    }
}

renderer.domElement.addEventListener('click', onMouseClick);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


setTimeout(() => {
    console.log("Making a test move...");
    const moveSuccess = game.makeMove(4, 1);
    updatePawnPositions();
    
    if (moveSuccess && !game.isGameOver() && game.currentPlayer === game.ai) {
        setTimeout(() => {
            game.makeAIMove();
            updatePawnPositions();
        }, 500);
    }
}, 2000);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();