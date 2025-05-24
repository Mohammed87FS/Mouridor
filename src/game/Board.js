class Board {
    constructor(size) {
        this.size = size;
        this.walls = {
            horizontal: new Set(), 
            vertical: new Set()   
        };
    }

    isInsideBoard(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    addWall(x, y, orientation) {
        const key = `${x},${y}`;
        if (orientation === 'horizontal') {
            this.walls.horizontal.add(key);
        } else if (orientation === 'vertical') {
            this.walls.vertical.add(key);
        }
        console.log(`Added ${orientation} wall at (${x},${y}). Total ${orientation} walls: ${this.walls[orientation].size}`);
    }

    hasWall(x, y, orientation) {
        const key = `${x},${y}`;
        if (orientation === 'horizontal') {
            return this.walls.horizontal.has(key);
        } else if (orientation === 'vertical') {
            return this.walls.vertical.has(key);
        }
        return false;
    }


    isMovementBlocked(fromX, fromY, toX, toY) {
        console.log(`Checking movement from (${fromX},${fromY}) to (${toX},${toY})`);
        
   
        if (toX > fromX) {
      
            const blocked = this.hasWall(toX, fromY, 'vertical');
            console.log(`Moving right: vertical wall at (${toX},${fromY})? ${blocked}`);
            return blocked;
        }
        
      
        if (toX < fromX) {
            
            const blocked = this.hasWall(fromX, fromY, 'vertical');
            console.log(`Moving left: vertical wall at (${fromX},${fromY})? ${blocked}`);
            return blocked;
        }
        
  
        if (toY > fromY) {
            
            const blocked = this.hasWall(fromX, toY, 'horizontal');
            console.log(`Moving down: horizontal wall at (${fromX},${toY})? ${blocked}`);
            return blocked;
        }
        
       
        if (toY < fromY) {
           
            const blocked = this.hasWall(fromX, fromY, 'horizontal');
            console.log(`Moving up: horizontal wall at (${fromX},${fromY})? ${blocked}`);
            return blocked;
        }
        
        return false;
    }


    isValidWallPlacement(x, y, orientation) {
        console.log(`Validating ${orientation} wall placement at (${x},${y})`);
        
        if (orientation === 'horizontal') {
        
            if (x < 0 || x >= this.size || y <= 0 || y >= this.size) {
                console.log(`Horizontal wall out of bounds`);
                return false;
            }
        } else if (orientation === 'vertical') {
          
            if (x <= 0 || x >= this.size || y < 0 || y >= this.size) {
                console.log(`Vertical wall out of bounds`);
                return false;
            }
        }

       
        if (this.hasWall(x, y, orientation)) {
            console.log(`Wall already exists at (${x},${y})`);
            return false;
        }

        console.log(`Wall placement valid`);
        return true;
    }

    getSize() {
        return this.size;
    }


    debugWalls() {
        console.log("Horizontal walls:", Array.from(this.walls.horizontal));
        console.log("Vertical walls:", Array.from(this.walls.vertical));
    }
}

export default Board;