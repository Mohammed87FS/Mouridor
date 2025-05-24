import Player from './Player.js'

class AI extends Player {
    constructor(kind, startPosition) {
        super(kind, startPosition);
        this.targetY = 8;
        this.aggressiveness = 0.3; 
        this.lastWallTurn = -5; 
        this.turnCount = 0;
    }

    makeMove(game) {
        console.log("AI is thinking...");
        this.turnCount++;
        
        const strategy = this.analyzeGameState(game);
        
        switch(strategy.action) {
            case 'block_human':
                this.lastWallTurn = this.turnCount;
                return this.tryBlockHuman(game, strategy);
            case 'move_forward':
                return this.tryMoveTowardGoal(game);
            case 'place_wall':
                this.lastWallTurn = this.turnCount;
                return this.tryPlaceStrategicWall(game, strategy);
            default:
                return this.tryMoveTowardGoal(game);
        }
    }

    analyzeGameState(game) {
        const humanPos = game.human.position;
        const aiPos = this.position;
        
        const humanDistanceToGoal = humanPos.y;
        const aiDistanceToGoal = Math.abs(aiPos.y - this.targetY);
        
        const humanCloseToWin = humanDistanceToGoal <= 2;
        const aiHasWalls = this.hasWallsLeft();
        const turnsSinceLastWall = this.turnCount - this.lastWallTurn;
        
  
        const shouldBlock = humanCloseToWin && aiHasWalls && turnsSinceLastWall >= 2;
        const shouldPlaceWall = aiHasWalls && 
            turnsSinceLastWall >= 3 && 
            (humanDistanceToGoal < aiDistanceToGoal || Math.random() < this.aggressiveness);
        
        console.log(`AI Analysis: Human distance: ${humanDistanceToGoal}, AI distance: ${aiDistanceToGoal}`);
        console.log(`Should block: ${shouldBlock}, Should place wall: ${shouldPlaceWall}, AI walls: ${this.getWallsLeft()}`);
        
        if (shouldBlock) {
            return { action: 'block_human', urgency: 'high', target: humanPos };
        } else if (shouldPlaceWall && humanDistanceToGoal > 2) {
            return { action: 'place_wall', urgency: 'medium' };
        } else {
            return { action: 'move_forward', urgency: 'low' };
        }
    }


    tryBlockHuman(game, strategy) {
        console.log("AI trying to block human!");
        
        const humanPos = game.human.position;
        
        const blockingWalls = [
            { x: humanPos.x, y: humanPos.y, orientation: 'horizontal' },
            { x: humanPos.x - 1, y: humanPos.y, orientation: 'horizontal' },
            { x: humanPos.x + 1, y: humanPos.y, orientation: 'horizontal' },
            { x: humanPos.x, y: humanPos.y, orientation: 'vertical' },
            { x: humanPos.x + 1, y: humanPos.y, orientation: 'vertical' }
        ];
        
        for (const wall of blockingWalls) {
            if (game.board.isValidWallPlacement(wall.x, wall.y, wall.orientation)) {
                console.log(`AI placing blocking ${wall.orientation} wall at (${wall.x}, ${wall.y})`);
                return game.placeWall(wall.x, wall.y, wall.orientation);
            }
        }
        
        return this.tryMoveTowardGoal(game);
    }

    tryPlaceStrategicWall(game, strategy) {
        console.log("AI trying to place strategic wall!");
        
        const humanPos = game.human.position;
        
        const strategicWalls = [
            { x: humanPos.x, y: Math.max(1, humanPos.y - 1), orientation: 'horizontal', priority: 3 },
            { x: humanPos.x, y: Math.max(1, humanPos.y - 2), orientation: 'horizontal', priority: 2 },
            { x: Math.max(1, humanPos.x - 1), y: humanPos.y, orientation: 'vertical', priority: 2 },
            { x: Math.min(7, humanPos.x + 1), y: humanPos.y, orientation: 'vertical', priority: 2 },
            { x: 4, y: 5, orientation: 'horizontal', priority: 1 },
            { x: 3, y: 4, orientation: 'vertical', priority: 1 },
            { x: 5, y: 4, orientation: 'vertical', priority: 1 }
        ];
        
        strategicWalls.sort((a, b) => b.priority - a.priority);
        
        for (const wall of strategicWalls) {
            if (game.board.isValidWallPlacement(wall.x, wall.y, wall.orientation)) {
                console.log(`AI placing strategic ${wall.orientation} wall at (${wall.x}, ${wall.y})`);
                return game.placeWall(wall.x, wall.y, wall.orientation);
            }
        }
        
        return this.tryMoveTowardGoal(game);
    }

    tryMoveTowardGoal(game) {
        console.log("AI trying to move toward goal!");
        
        const { x: currentX, y: currentY } = this.position;
        
        const moves = [
            { x: currentX, y: currentY + 1, priority: 5 },
        ];
        
        if (currentX !== 4) {
            moves.push({ 
                x: currentX < 4 ? currentX + 1 : currentX - 1, 
                y: currentY, 
                priority: 3 
            });
        }
        
        moves.push({ x: currentX - 1, y: currentY, priority: 2 });
        moves.push({ x: currentX + 1, y: currentY, priority: 2 });
        moves.push({ x: currentX, y: currentY - 1, priority: 1 });
        
        moves.sort((a, b) => b.priority - a.priority);
        
        for (const move of moves) {
            if (game.isValidMove(move.x, move.y)) {
                console.log(`AI moving to (${move.x}, ${move.y}) with priority ${move.priority}`);
                return game.makeMove(move.x, move.y);
            }
        }
        
        console.log("AI has no valid moves!");
        return false;
    }
}

export default AI;