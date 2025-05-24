import Player from './Player.js'

class AI extends Player {
    constructor(kind, startPosition) {
        super(kind, startPosition);
        this.targetY = 8;
        console.log(`AI initialized at (${startPosition.x}, ${startPosition.y}), target: y=${this.targetY}`);
        this.aggressiveness = 0.6; 
        this.lastWallTurn = -5;
        this.turnCount = 0;
        this.difficulty = 'hard';
        this.pathCache = new Map();
    }

    makeMove(game) {
        console.log("=== AI MAKING DECISION ===");
        console.log(`AI position: (${this.position.x}, ${this.position.y})`);
        console.log(`Human position: (${game.human.position.x}, ${game.human.position.y})`);
        
        this.turnCount = Math.floor((game.moveHistory?.length || 0) / 2) + 1;
        
        
        if (this.turnCount % 5 === 0) {
            this.pathCache.clear();
        }
        
        const bestMove = this.findBestMove(game);
        console.log(`AI decided on: ${bestMove.type} with score ${bestMove.score}`);
        
        if (bestMove.type === 'wall') {
            this.lastWallTurn = this.turnCount;
            console.log(`AI placing ${bestMove.orientation} wall at (${bestMove.x}, ${bestMove.y})`);
            return game.placeWall(bestMove.x, bestMove.y, bestMove.orientation);
        } else {
            console.log(`AI moving to (${bestMove.x}, ${bestMove.y})`);
            return game.makeMove(bestMove.x, bestMove.y);
        }
    }

    findBestMove(game) {
        console.log("=== FINDING BEST MOVE ===");
        const moves = [];
        
        
        const myPath = this.findShortestPath(game, this.position, { x: this.position.x, y: this.targetY });
        const humanPath = this.findShortestPath(game, game.human.position, { x: game.human.position.x, y: 0 });
        
        console.log(`My path length: ${myPath ? myPath.length : 'blocked'}`);
        console.log(`Human path length: ${humanPath ? humanPath.length : 'blocked'}`);
        
        
        const possibleMoves = this.getPossibleMoves(game);
        console.log(`Possible moves: ${possibleMoves.length}`);
        
        for (const move of possibleMoves) {
            const score = this.evaluateMove(game, move, myPath, humanPath);
            moves.push({ ...move, score, type: 'move' });
        }
        
        
        if (this.hasWallsLeft() && humanPath && humanPath.length <= 6) {
            console.log("Considering wall placements...");
            const wallMoves = this.findBestWallPlacements(game, humanPath);
            moves.push(...wallMoves);
        }
        
        
        moves.sort((a, b) => b.score - a.score);
        
        if (moves.length === 0) {
            console.error("No valid moves found!");
            
            const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
            for (const [dx, dy] of dirs) {
                const x = this.position.x + dx;
                const y = this.position.y + dy;
                if (game.isValidMove(x, y)) {
                    return { x, y, score: 0, type: 'move' };
                }
            }
        }
        
        return moves[0];
    }

    getPossibleMoves(game) {
        const moves = [];
        const { x, y } = this.position;
        
        
        const directions = [
            { dx: 0, dy: 1, name: 'down' },
            { dx: 0, dy: -1, name: 'up' },
            { dx: 1, dy: 0, name: 'right' },
            { dx: -1, dy: 0, name: 'left' }
        ];
        
        for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            
            if (game.isValidMove(newX, newY)) {
                moves.push({ x: newX, y: newY });
            }
        }
        
        return moves;
    }

    evaluateMove(game, move, currentAIPath, currentHumanPath) {
        let score = 0;
        
        
        const tempGame = this.simulateMove(game, move);
        const newPath = this.findShortestPath(tempGame, move, { x: move.x, y: this.targetY });
        
        if (!newPath) {
            console.log(`Move to (${move.x}, ${move.y}) would leave no path to goal`);
            return -10000;
        }
        
        
        const currentDistance = currentAIPath ? currentAIPath.length : 999;
        const newDistance = newPath.length;
        const improvement = currentDistance - newDistance;
        
        score += improvement * 1000; 
        
        
        if (move.y > this.position.y) {
            score += 200; 
        } else if (move.y < this.position.y) {
            score -= 100; 
        }
        
        
        const centerDistance = Math.abs(move.x - 4);
        score += (4 - centerDistance) * 10;
        
        
        if (newDistance <= 2) {
            score += 5000;
        }
        
        console.log(`Move to (${move.x}, ${move.y}): distance ${newDistance}, improvement ${improvement}, score ${score}`);
        
        return score;
    }

    findBestWallPlacements(game, humanPath) {
        const walls = [];
        
        if (!humanPath || humanPath.length < 2) return walls;
        
        
        for (let i = 1; i < Math.min(4, humanPath.length); i++) {
            const from = humanPath[i - 1];
            const to = humanPath[i];
            
            
            const blockingWalls = this.getWallsToBlockMove(from, to);
            
            for (const wall of blockingWalls) {
                if (game.board.isValidWallPlacement(wall.x, wall.y, wall.orientation)) {
                    const score = this.evaluateWallPlacement(game, wall);
                    if (score > 100) { 
                        walls.push({ ...wall, score, type: 'wall' });
                    }
                }
            }
        }
        
        return walls;
    }

    getWallsToBlockMove(from, to) {
        const walls = [];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        if (dy === 1) { 
            
            walls.push({ x: Math.max(0, to.x - 1), y: to.y, orientation: 'horizontal' });
            walls.push({ x: to.x, y: to.y, orientation: 'horizontal' });
        } else if (dy === -1) { 
            
            walls.push({ x: Math.max(0, from.x - 1), y: from.y, orientation: 'horizontal' });
            walls.push({ x: from.x, y: from.y, orientation: 'horizontal' });
        } else if (dx === 1) { 
            
            walls.push({ x: to.x, y: Math.max(0, to.y - 1), orientation: 'vertical' });
            walls.push({ x: to.x, y: to.y, orientation: 'vertical' });
        } else if (dx === -1) { 
            
            walls.push({ x: from.x, y: Math.max(0, from.y - 1), orientation: 'vertical' });
            walls.push({ x: from.x, y: from.y, orientation: 'vertical' });
        }
        
        return walls;
    }

    evaluateWallPlacement(game, wall) {
        
        const tempGame = this.simulateWallPlacement(game, wall);
        if (!tempGame) return -10000;
        
        const humanPos = game.human.position;
        const aiPos = this.position;
        
        
        const humanPathBefore = this.findShortestPath(game, humanPos, { x: humanPos.x, y: 0 });
        const aiPathBefore = this.findShortestPath(game, aiPos, { x: aiPos.x, y: 8 });
        
        const humanPathAfter = this.findShortestPath(tempGame, humanPos, { x: humanPos.x, y: 0 });
        const aiPathAfter = this.findShortestPath(tempGame, aiPos, { x: aiPos.x, y: 8 });
        
        
        if (!humanPathAfter || !aiPathAfter) {
            return -10000;
        }
        
        const humanDelay = humanPathAfter.length - (humanPathBefore ? humanPathBefore.length : 100);
        const aiDelay = aiPathAfter.length - (aiPathBefore ? aiPathBefore.length : 100);
        
        
        let score = (humanDelay - aiDelay) * 100;
        
        
        if (humanDelay >= 3) {
            score += 300;
        }
        
        
        if (humanPathBefore && humanPathBefore.length <= 3) {
            score += 500;
        }
        
        
        if (aiDelay > 1) {
            score -= aiDelay * 50;
        }
        
        console.log(`Wall at (${wall.x}, ${wall.y}) ${wall.orientation}: human +${humanDelay}, ai +${aiDelay}, score ${score}`);
        
        return score;
    }

    findShortestPath(game, start, goal) {
        const cacheKey = `${start.x},${start.y}-${goal.x},${goal.y}`;
        
        
        const queue = [{ pos: start, path: [start] }];
        const visited = new Set([`${start.x},${start.y}`]);
        
        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            
            
            if (pos.y === goal.y) {
                return path;
            }
            
            
            const directions = [
                { dx: 0, dy: 1 },
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: -1, dy: 0 }
            ];
            
            for (const { dx, dy } of directions) {
                const newX = pos.x + dx;
                const newY = pos.y + dy;
                const key = `${newX},${newY}`;
                
                
                if (visited.has(key)) continue;
                
                
                if (!game.board.isInsideBoard(newX, newY)) continue;
                if (game.board.isMovementBlocked(pos.x, pos.y, newX, newY)) continue;
                
                visited.add(key);
                queue.push({
                    pos: { x: newX, y: newY },
                    path: [...path, { x: newX, y: newY }]
                });
            }
        }
        
        return null; 
    }

    simulateMove(game, move) {
        
        return {
            board: game.board,
            human: game.human,
            ai: { ...this, position: move },
            isValidMove: game.isValidMove.bind(game)
        };
    }

    simulateWallPlacement(game, wall) {
        try {
            
            const tempWalls = {
                horizontal: new Set(game.board.walls.horizontal),
                vertical: new Set(game.board.walls.vertical)
            };
            
            
            const wallKey = `${wall.x},${wall.y}`;
            tempWalls[wall.orientation].add(wallKey);
            
            
            const tempBoard = {
                walls: tempWalls,
                isInsideBoard: game.board.isInsideBoard.bind(game.board),
                hasWall: function(x, y, orientation) {
                    const key = `${x},${y}`;
                    return tempWalls[orientation].has(key);
                },
                isMovementBlocked: function(fromX, fromY, toX, toY) {
                    if (fromY === toY && Math.abs(fromX - toX) === 1) {
                        const wallX = Math.min(fromX, toX);
                        return this.hasWall(wallX, fromY, 'vertical');
                    } else if (fromX === toX && Math.abs(fromY - toY) === 1) {
                        const wallY = Math.min(fromY, toY);
                        return this.hasWall(fromX, wallY, 'horizontal');
                    }
                    return false;
                }
            };
            
            
            return {
                board: tempBoard,
                human: game.human,
                ai: this
            };
        } catch (e) {
            console.error("Wall simulation error:", e);
            return null;
        }
    }

    canReachGoal(game, position) {
        const path = this.findShortestPath(game, position, { x: position.x, y: this.targetY });
        return path !== null;
    }
}

export default AI;