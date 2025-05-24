import Game from './game/Game.js';
import SceneManager from './graphics/Scene.js';
import CameraManager from './graphics/Camera.js';
import RendererManager from './graphics/Renderer.js';
import BoardFactory from './graphics/BoardFactory.js';
import PawnFactory from './graphics/PawnFactory.js';
import InputHandler from './game/InputHandler.js';
import GameController from './game/GameController.js';

const CONFIG = {
    board: {
        size: 9,
        squareSize: 0.95
    },
    pawn: {
        height: 0.5,
        radius: 0.3,
        yPosition: 0.35
    },
    colors: {
        human: 0x0000ff,
        ai: 0xff0000,
        squareLight: 0x8B4513,
        squareDark: 0xA0522D,
        highlight: 0x00ff00
    },
    camera: {
        fov: 50,
        position: { x: 0, y: 10, z: 10 },
        lookAt: { x: 0, y: 0, z: 0 }
    },
    renderer: {
        clearColor: 0x000000,
        antialias: true
    }
};

class GameApp {
    constructor() {
        this.game = new Game();
        this.sceneManager = new SceneManager();
        this.cameraManager = new CameraManager(CONFIG.camera);
        this.rendererManager = new RendererManager('gameCanvas', CONFIG.renderer);
        this.boardFactory = new BoardFactory({
            boardSize: CONFIG.board.size,
            squareSize: CONFIG.board.squareSize,
            colors: {
                light: CONFIG.colors.squareLight,
                dark: CONFIG.colors.squareDark
            }
        });
        this.pawnFactory = new PawnFactory({
            ...CONFIG.pawn,
            colors: {
                human: CONFIG.colors.human,
                ai: CONFIG.colors.ai
            }
        });

        this.inputHandler = new InputHandler(
            this.rendererManager,
            this.cameraManager.getCamera()
        );

        this.gameController = new GameController(
            this.game,
            this.sceneManager,
            { highlight: CONFIG.colors.highlight }
        );
    }

    init() {
        this.game.start();
        this.createBoard();
        this.createPawns();
        this.setupEventHandlers();
        this.gameController.updatePawnPositions();
        this.animate();
    }

    createBoard() {
        const squares = this.boardFactory.createBoard();
        this.sceneManager.setSquares(squares);
        this.inputHandler.setSquares(squares); 

        squares.forEach(row => {
            row.forEach(square => {
                this.sceneManager.addToScene(square);
            });
        });
    }

    createPawns() {
        const humanPawn = this.pawnFactory.createHumanPawn();
        const aiPawn = this.pawnFactory.createAIPawn();

        this.sceneManager.setPawns(humanPawn, aiPawn);
        this.sceneManager.addToScene(humanPawn);
        this.sceneManager.addToScene(aiPawn);
    }

    setupEventHandlers() {
        this.inputHandler.setClickCallback((clickedSquare, event) => {
         
            this.gameController.handleSquareClick(clickedSquare);
        });

        this.inputHandler.setResizeCallback((width, height) => {
            this.cameraManager.updateAspect(width, height);
            this.rendererManager.resize(width, height);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.rendererManager.render(
            this.sceneManager.getScene(),
            this.cameraManager.getCamera()
        );
    }
}


const app = new GameApp();
app.init();