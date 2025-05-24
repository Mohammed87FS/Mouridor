import Game from './game/Game.js';
import EnhancedScene from './graphics/EnhancedScene.js';
import CameraManager from './graphics/Camera.js';
import RendererManager from './graphics/Renderer.js';
import BoardFactory from './graphics/BoardFactory.js';
import PawnFactory from './graphics/PawnFactory.js';
import InputHandler from './game/InputHandler.js';
import GameController from './game/GameController.js';
import WallFactory from './graphics/WallFactory.js';
import ModernHUD from './ui/HUD.js';
import MaterialFactory from './graphics/MaterialFactory.js';
import ParticleSystem from './graphics/ParticleSystem.js';
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
        color: 0x00ffff, 
        thickness: 0.2,
        height: 0.8,
        length: 1.0
    },
    colors: {
        human: 0x4facfe,
        ai: 0xfa709a,
        squareLight: 0x2a2a3e,
        squareDark: 0x1a1a2e,
        highlight: 0x00ff88
    },
    camera: {
        fov: 50,
        position: { x: 0, y: 12, z: 12 },
        lookAt: { x: 0, y: 0, z: 0 }
    },
    renderer: {
        clearColor: 0x0a0a0a,
        antialias: true
    }
};
 class GameApp {
    constructor() {
        this.game = new Game();
        this.sceneManager = new EnhancedScene();
        this.cameraManager = new CameraManager(CONFIG.camera);
        this.rendererManager = new RendererManager('gameCanvas', CONFIG.renderer);
        this.wallFactory = new WallFactory(CONFIG.wall);
        this.materialFactory = new MaterialFactory();
        this.modernHUD = new ModernHUD();
        this.wallPlacementMode = null;
        this.turnCount = 1;
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
         this.setupHUDEvents();
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
         this.updateHUD();
         this.animate();
     }
     setupHUDEvents() {
        document.addEventListener('gameModeChange', (e) => {
            const mode = e.detail.mode;
             switch(mode) {
                case 'move':
                    this.wallPlacementMode = null;
                    break;
                case 'horizontal':
                    this.wallPlacementMode = 'horizontal';
                    break;
                case 'vertical':
                    this.wallPlacementMode = 'vertical';
                    break;
                case 'auto':
                    this.wallPlacementMode = 'auto';
                    break;
            }
         });
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
        const humanPawn = this.sceneManager.createEnhancedPawn(CONFIG.colors.human, true);
        const aiPawn = this.sceneManager.createEnhancedPawn(CONFIG.colors.ai, false);
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
     handleKeyPress(event) {
        switch(event.key.toLowerCase()) {
            case 'h':
                this.wallPlacementMode = 'horizontal';
                 document.querySelector('#horizontal-btn')?.click();
                break;
            case 'v':
                this.wallPlacementMode = 'vertical';
                 document.querySelector('#vertical-btn')?.click();
                break;
            case 'w':
                this.wallPlacementMode = 'auto';
                 document.querySelector('#auto-btn')?.click();
                break;
            case 'escape':
            case 'm':
                this.wallPlacementMode = null;
                 document.querySelector('#move-btn')?.click();
                break;
        }
    }
     createVisualWall(x, y, orientation) {
        let wall;
        if (orientation === 'horizontal') {
            wall = this.wallFactory.createHorizontalWall(x, y);
        } else {
            wall = this.wallFactory.createVerticalWall(x, y);
        }
         wall.material = this.materialFactory.createHolographicWallMaterial(CONFIG.wall.color);
         this.sceneManager.addToScene(wall);
         this.sceneManager.createWallEffect(wall.position, orientation);
         console.log(`Created visual ${orientation} wall at (${x}, ${y})`);
    }
     placeWall(x, y, orientation) {
        return this.game.placeWall(x, y, orientation);
    }
     handleSquareClick(clickedSquare) {
        const moveSuccess = this.gameController.handleSquareClick(clickedSquare);
         if (moveSuccess) {
            this.turnCount++;
            this.updateHUD();
             const pawns = this.sceneManager.getPawns();
            const humanPawn = pawns.human;
            this.sceneManager.createMoveEffect(
                humanPawn.position,
                { x: clickedSquare.userData.gridX - 4, y: 0.35, z: clickedSquare.userData.gridY - 4 },
                CONFIG.colors.human
            );
             if (!this.game.isGameOver() && this.game.getCurrentPlayer() === this.game.ai) {
                setTimeout(() => {
                    this.handleAITurn();
                }, 1000);
            }
        }
    }
 handleAITurn() {
    console.log("=== HANDLING AI TURN ===");
    console.log(`Current player before AI move: ${this.game.getCurrentPlayer().kind}`);
     const aiMoveSuccess = this.game.makeAIMove();
    console.log(`AI move success: ${aiMoveSuccess}`);
    console.log(`Current player after AI move: ${this.game.getCurrentPlayer().kind}`);
     if (aiMoveSuccess) {
        this.turnCount++;
        this.gameController.updatePawnPositions();
        this.updateHUD();
         const pawns = this.sceneManager.getPawns();
        const aiPawn = pawns.ai;
        this.sceneManager.createMoveEffect(
            aiPawn.position,
            aiPawn.position,
            CONFIG.colors.ai
        );
    } else {
        console.error("AI move failed!");
    }
}
     updateHUD() {
        this.modernHUD.updatePlayerStats(
            this.game.human.getWallsLeft(),
            this.game.ai.getWallsLeft(),
            this.game.getCurrentPlayer().kind,
            this.turnCount
        );
         this.modernHUD.updateMiniMap(
            this.game.human.position,
            this.game.ai.position,
            {
                horizontal: Array.from(this.game.board.walls.horizontal),
                vertical: Array.from(this.game.board.walls.vertical)
            }
        );
    }
     handleWallPlacementWithEdges(event) {
        if (!this.wallPlacementMode) return;
         if (this.game.getCurrentPlayer() !== this.game.human) {
             return;
        }
         const squares = this.sceneManager.getSquares();
        const edgeInfo = this.inputHandler.getClickedEdge(event, squares);
         if (!edgeInfo) return;
         const { gridX, gridY, orientation } = edgeInfo;
        const finalOrientation = this.wallPlacementMode === 'auto' ? orientation : this.wallPlacementMode;
         const success = this.placeWall(gridX, gridY, finalOrientation);
         if (success) {
            this.wallPlacementMode = null;
            this.turnCount++;
            this.updateHUD();
             document.querySelector('#move-btn')?.click();
             if (!this.game.isGameOver() && this.game.getCurrentPlayer() === this.game.ai) {
                setTimeout(() => {
                    this.handleAITurn();
                }, 1000);
            }
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