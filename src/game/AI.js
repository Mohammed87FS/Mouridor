import Player from './Player.js'

class AI extends Player {
    constructor(kind, startPosition) {
        super(kind, startPosition);
        this.targetY = 8;
        console.log(`AI initialized at (${startPosition.x}, ${startPosition.y}), target: y=${this.targetY}`);
        this.difficulty = 'hard';
        this.pathCache = new Map();
        this.turnCount = 0;
    }

    makeMove(game) {
        console.log("\n=== AI MAKING DECISION ===");
        console.log(`AI position: (${this.position.x}, ${this.position.y})`);
        console.log(`Human position: (${game.human.position.x}, ${game.human.position.y})`);
        console.log(`AI walls left: ${this.wallsLeft}, Human walls left: ${game.human.wallsLeft}`);
        
        this.turnCount++;
        
        
        if (this.turnCount % 5 === 0) {
            this.pathCache.clear();
        }
        
        const bestMove = this.findBestMove(game);
        console.log(`\nFINAL DECISION: ${bestMove.type} with score ${bestMove.score}`);
        
        if (bestMove.type === 'wall') {
            console.log(`Placing ${bestMove.orientation} wall at (${bestMove.x}, ${bestMove.y})`);
            return game.placeWall(bestMove.x, bestMove.y, bestMove.orientation);
        } else {
            console.log(`Moving to (${bestMove.x}, ${bestMove.y})`);
            return game.makeMove(bestMove.x, bestMove.y);
        }
    }

    findBestMove(game) {
        
        const myPath = this.findShortestPath(game, this.position, this.targetY);
        const humanPath = this.findShortestPath(game, game.human.position, 0);
        
        const myDistance = myPath ? myPath.length - 1 : 999;
        const humanDistance = humanPath ? humanPath.length - 1 : 999;
        
        console.log(`\nCurrent distances - AI: ${myDistance}, Human: ${humanDistance}`);
        
        const moves = [];
        
        
        const humanCanWinNextTurn = humanDistance === 1;
        const isEmergency = humanDistance <= 2;
        const isCritical = humanDistance <= 4;
        
        if (humanCanWinNextTurn) {
            console.log("\n🚨 EMERGENCY: Human can win on next turn!");
        } else if (isEmergency) {
            console.log("\n⚠️ WARNING: Human very close to winning!");
        } else if (isCritical) {
            console.log("\n📍 ALERT: Human approaching goal!");
        }
        
        
        if (humanCanWinNextTurn && this.hasWallsLeft()) {
            console.log("Searching for emergency blocking walls...");
            const blockingWalls = this.findUrgentBlockingWalls(game, humanPath);
            
            if (blockingWalls.length > 0) {
                
                return blockingWalls[0];
            } else {
                console.log("WARNING: No blocking walls found!");
            }
        }
        
        
        const possibleMoves = this.getPossibleMoves(game);
        for (const move of possibleMoves) {
            const score = this.evaluateMove(game, move, myPath, humanPath);
            moves.push({ ...move, score, type: 'move' });
        }
        
        
        if (this.hasWallsLeft() && !humanCanWinNextTurn) {
            if (isEmergency || (isCritical && humanDistance <= myDistance)) {
                console.log("Evaluating blocking walls...");
                const blockingWalls = this.findBlockingWalls(game, humanPath);
                moves.push(...blockingWalls);
            }
        }
        
        
        moves.sort((a, b) => b.score - a.score);
        
        if (moves.length === 0) {
            console.error("No valid moves found!");
            return this.getEmergencyMove(game);
        }
        
        
        console.log("\nTop moves:");
        moves.slice(0, 3).forEach(m => {
            console.log(`  ${m.type} ${m.type === 'wall' ? m.orientation + ' at' : 'to'} (${m.x}, ${m.y}): score ${m.score}`);
        });
        
        return moves[0];
    }

    findUrgentBlockingWalls(game, humanPath) {
        const walls = [];
        
        if (!humanPath || humanPath.length < 2) return walls;
        
        
        const humanPos = game.human.position;
        const winningMove = humanPath[1]; 
        
        console.log(`Human winning move: from (${humanPos.x}, ${humanPos.y}) to (${winningMove.x}, ${winningMove.y})`);
        
        
        const blockingPositions = this.getAllBlockingWallsForMove(humanPos, winningMove);
        
        for (const wall of blockingPositions) {
            if (game.board.isValidWallPlacement(wall.x, wall.y, wall.orientation)) {
                
                const tempGame = this.simulateWallPlacement(game, wall);
                if (tempGame) {
                    const newHumanPath = this.findShortestPath(tempGame, humanPos, 0);
                    const aiPath = this.findShortestPath(tempGame, this.position, this.targetY);
                    
                    
                    if (newHumanPath && aiPath) {
                        const delay = newHumanPath.length - humanPath.length;
                        if (delay > 0) {
                            
                            const score = 10000 + delay * 1000; 
                            walls.push({ ...wall, score, type: 'wall' });
                            console.log(`✓ Wall at (${wall.x}, ${wall.y}) ${wall.orientation} delays human by ${delay} moves!`);
                        }
                    }
                }
            }
        }
        
        walls.sort((a, b) => b.score - a.score);
        return walls;
    }

    getAllBlockingWallsForMove(from, to) {
        const walls = [];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        if (dy === -1) { 
            
            walls.push({ x: from.x, y: from.y, orientation: 'horizontal' });
            if (from.x > 0) {
                walls.push({ x: from.x - 1, y: from.y, orientation: 'horizontal' });
            }
        } else if (dy === 1) { 
            
            walls.push({ x: to.x, y: to.y, orientation: 'horizontal' });
            if (to.x > 0) {
                walls.push({ x: to.x - 1, y: to.y, orientation: 'horizontal' });
            }
        } else if (dx === 1) { 
            
            walls.push({ x: to.x, y: to.y, orientation: 'vertical' });
            if (to.y > 0) {
                walls.push({ x: to.x, y: to.y - 1, orientation: 'vertical' });
            }
        } else if (dx === -1) { 
            
            walls.push({ x: from.x, y: from.y, orientation: 'vertical' });
            if (from.y > 0) {
                walls.push({ x: from.x, y: from.y - 1, orientation: 'vertical' });
            }
        }
        
        
        return walls.filter(w => w.x >= 0 && w.x <= 7 && w.y >= 0 && w.y <= 7);
    }

    findBlockingWalls(game, humanPath) {
        const walls = [];
        
        if (!humanPath || humanPath.length < 2) return walls;
        
        
        const stepsToCheck = Math.min(4, humanPath.length - 1);
        
        for (let i = 0; i < stepsToCheck; i++) {
            const from = humanPath[i];
            const to = humanPath[i + 1];
            
            const blockingPositions = this.getAllBlockingWallsForMove(from, to);
            
            for (const wall of blockingPositions) {
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

    evaluateWallPlacement(game, wall) {
        
        const tempGame = this.simulateWallPlacement(game, wall);
        if (!tempGame) return -10000;
        
        const humanPos = game.human.position;
        const aiPos = this.position;
        
        
        const humanPathBefore = this.findShortestPath(game, humanPos, 0);
        const aiPathBefore = this.findShortestPath(game, aiPos, this.targetY);
        
        
        const humanPathAfter = this.findShortestPath(tempGame, humanPos, 0);
        const aiPathAfter = this.findShortestPath(tempGame, aiPos, this.targetY);
        
        
        if (!humanPathAfter || !aiPathAfter) {
            return -10000;
        }
        
        const humanBefore = humanPathBefore ? humanPathBefore.length - 1 : 100;
        const aiBefore = aiPathBefore ? aiPathBefore.length - 1 : 100;
        const humanAfter = humanPathAfter.length - 1;
        const aiAfter = aiPathAfter.length - 1;
        
        const humanDelay = humanAfter - humanBefore;
        const aiDelay = aiAfter - aiBefore;
        
        
        if (humanDelay <= 0) {
            return -100;
        }
        
        let score = humanDelay * 300 - aiDelay * 150;
        
        
        if (humanBefore <= 2) {
            score += 3000 + humanDelay * 1000;
        } else if (humanBefore <= 4) {
            score += 1500 + humanDelay * 500;
        } else if (humanBefore <= 6) {
            score += 500 + humanDelay * 200;
        }
        
        console.log(`Wall at (${wall.x}, ${wall.y}) ${wall.orientation}: human +${humanDelay}, ai +${aiDelay}, score ${score}`);
        
        return score;
    }

    getPossibleMoves(game) {
        const moves = [];
        const { x, y } = this.position;
        
        const directions = [
            { dx: 0, dy: 1 },   
            { dx: 0, dy: -1 },  
            { dx: 1, dy: 0 },   
            { dx: -1, dy: 0 }   
        ];
        
        for (const { dx, dy } of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (game.isValidMove(newX, newY)) {
                moves.push({ x: newX, y: newY });
            }
        }
        
        return moves;
    }

    evaluateMove(game, move, currentAIPath, currentHumanPath) {
        
        const tempGame = this.simulateMove(game, move);
        const newPath = this.findShortestPath(tempGame, move, this.targetY);
        
        if (!newPath) {
            return -10000;
        }
        
        const currentDistance = currentAIPath ? currentAIPath.length - 1 : 999;
        const newDistance = newPath.length - 1;
        const improvement = currentDistance - newDistance;
        
        let score = improvement * 1000;
        
        
        if (move.y > this.position.y) {
            score += 300;
        } else if (move.y < this.position.y) {
            score -= 200;
        }
        
        
        if (newDistance === 0) {
            score += 50000;
        } else if (newDistance === 1) {
            score += 10000;
        } else if (newDistance === 2) {
            score += 5000;
        }
        
        
        const centerDistance = Math.abs(move.x - 4);
        score += (4 - centerDistance) * 10;
        
        return score;
    }

    findShortestPath(game, start, goalY) {
        
        const queue = [{ pos: start, path: [start] }];
        const visited = new Set([`${start.x},${start.y}`]);
        
        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            
            
            if (pos.y === goalY) {
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
            ai: { ...this, position: move }
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
                isInsideBoard: (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 8,
                
                hasWall: function(x, y, orientation) {
                    return tempWalls[orientation].has(`${x},${y}`);
                },
                
                isMovementBlocked: function(fromX, fromY, toX, toY) {
                    
                    if (fromY === toY && Math.abs(fromX - toX) === 1) {
                        const wallX = Math.min(fromX, toX);
                        const wallY = fromY;
                        
                        
                        if (wallY > 0 && this.hasWall(wallX, wallY - 1, 'vertical')) return true;
                        if (this.hasWall(wallX, wallY, 'vertical')) return true;
                        
                        return false;
                    }
                    
                    
                    if (fromX === toX && Math.abs(fromY - toY) === 1) {
                        const wallX = fromX;
                        const wallY = Math.min(fromY, toY);
                        
                        
                        if (wallX > 0 && this.hasWall(wallX - 1, wallY, 'horizontal')) return true;
                        if (this.hasWall(wallX, wallY, 'horizontal')) return true;
                        
                        return false;
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

    getEmergencyMove(game) {
        
        const dirs = [[0,1], [1,0], [-1,0], [0,-1]];
        for (const [dx, dy] of dirs) {
            const x = this.position.x + dx;
            const y = this.position.y + dy;
            if (game.isValidMove(x, y)) {
                return { x, y, score: 0, type: 'move' };
            }
        }
        return { x: this.position.x, y: this.position.y, score: 0, type: 'move' };
    }

    canReachGoal(game, position) {
        const path = this.findShortestPath(game, position, this.targetY);
        return path !== null;
    }
}

export default AI;