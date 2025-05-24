import Game from './game/Game.js';
import SceneManager from './graphics/Scene.js';
import CameraManager from './graphics/Camera.js';
import RendererManager from './graphics/Renderer.js';
import BoardFactory from './graphics/BoardFactory.js';
import PawnFactory from './graphics/PawnFactory.js';
import InputHandler from './game/InputHandler.js';
import GameController from './game/GameController.js';
import WallFactory from './graphics/WallFactory.js';

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
    wall: {
        color: 0xBFBF00, 
        thickness: 0.2, 
        height: 0.8,    
        length: 1.0
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
        this.wallFactory = new WallFactory(CONFIG.wall);
        this.wallPlacementMode = null;
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
        this.game.setWallCreationCallback((x, y, orientation) => {
            this.createVisualWall(x, y, orientation);
        });
        this.createBoard();
        this.createPawns();
        this.setupEventHandlers();
        this.gameController.updatePawnPositions();
        this.animate();
    }

    createVisualWall(x, y, orientation) {
        let wall;
        if (orientation === 'horizontal') {
            wall = this.wallFactory.createHorizontalWall(x, y);
        } else {
            wall = this.wallFactory.createVerticalWall(x, y);
        }
        this.sceneManager.addToScene(wall);
        console.log(`Created visual ${orientation} wall at (${x}, ${y})`);
    }

    placeWall(x, y, orientation) {
        const success = this.game.placeWall(x, y, orientation);
        return success;
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
            if (this.wallPlacementMode) {
                this.handleWallPlacementWithEdges(event);
            } else {
                this.handleSquareClick(clickedSquare);
            }
        });

        this.inputHandler.setResizeCallback((width, height) => {
            this.cameraManager.updateAspect(width, height);
            this.rendererManager.resize(width, height);
        });

        this.inputHandler.setKeyCallback((event) => {
            this.handleKeyPress(event);
        });
    }

    handleWallPlacementWithEdges(event) {
        if (!this.wallPlacementMode) return;
        
        if (this.game.getCurrentPlayer() !== this.game.human) {
            console.log("Not human's turn!");
            return;
        }

        const squares = this.sceneManager.getSquares();
        const edgeInfo = this.inputHandler.getClickedEdge(event, squares);
        
        if (!edgeInfo) return;

        const { gridX, gridY, orientation } = edgeInfo;
        
        console.log(`Attempting to place ${orientation} wall at edge (${gridX}, ${gridY})`);
        
        const finalOrientation = this.wallPlacementMode === 'auto' ? orientation : this.wallPlacementMode;
        
        const success = this.placeWall(gridX, gridY, finalOrientation);
        
        if (success) {
            this.wallPlacementMode = null;
            console.log("Wall placed! Mode reset to movement.");
            
          
            if (!this.game.isGameOver() && this.game.getCurrentPlayer() === this.game.ai) {
                setTimeout(() => {
                    this.handleAITurn();
                }, 1000);
            }
        }
    }

    handleSquareClick(clickedSquare) {
        const moveSuccess = this.gameController.handleSquareClick(clickedSquare);
        
        if (moveSuccess && !this.game.isGameOver() && this.game.getCurrentPlayer() === this.game.ai) {
            setTimeout(() => {
                this.handleAITurn();
            }, 1000);
        }
    }


    handleAITurn() {
        const aiMoveSuccess = this.game.makeAIMove();
        if (aiMoveSuccess) {
            this.gameController.updatePawnPositions();
        }
        
    }

    handleKeyPress(event) {
        switch(event.key.toLowerCase()) {
            case 'h':
                this.wallPlacementMode = 'horizontal';
                console.log("Horizontal wall placement mode activated.");
                break;
            case 'v':
                this.wallPlacementMode = 'vertical';
                console.log("Vertical wall placement mode activated.");
                break;
            case 'w':
                this.wallPlacementMode = 'auto';
                console.log("Auto wall placement mode activated. Click near edges.");
                break;
            case 'escape':
            case 'm':
                this.wallPlacementMode = null;
                console.log("Wall placement mode deactivated.");
                break;
        }
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