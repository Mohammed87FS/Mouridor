class ModernHUD {
    constructor() {
        this.hudContainer = null;
        this.playerStats = null;
        this.gameControls = null;
        this.notifications = [];
        this.init();
    }

    init() {
        this.createHUDContainer();
        this.createPlayerStats();
        this.createGameControls();
        this.createNotificationSystem();
        this.createMiniMap();
        this.addAnimations();
    }

    createHUDContainer() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'modern-hud';
        this.hudContainer.innerHTML = `
            <style>
                #modern-hud {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    pointer-events: none;
                    z-index: 1000;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    pointer-events: auto;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .glass-panel:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
                }

                .player-stats {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    padding: 20px;
                    min-width: 250px;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 12px 0;
                    color: white;
                    font-weight: 500;
                }

                .stat-value {
                    font-size: 1.2em;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                }

                .game-controls {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 20px;
                    display: flex;
                    gap: 16px;
                }

                .control-btn {
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
                }

                .control-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
                }

                .control-btn.active {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    box-shadow: 0 4px 16px rgba(240, 147, 251, 0.4);
                }

                .notification-container {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    max-width: 300px;
                }

                .notification {
                    margin-bottom: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 500;
                    animation: slideInRight 0.5s ease;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                }

                .notification.success {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                .notification.warning {
                    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
                }

                .notification.info {
                    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
                    color: #333;
                }

                .mini-map {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 180px;
                    height: 180px;
                    padding: 16px;
                    margin-top: 200px;
                }

                .map-grid {
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: repeat(9, 1fr);
                    grid-template-rows: repeat(9, 1fr);
                    gap: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .map-cell {
                    background: rgba(255, 255, 255, 0.05);
                    transition: all 0.2s ease;
                }

                .map-cell.human {
                    background: #4facfe;
                    box-shadow: 0 0 8px #4facfe;
                }

                .map-cell.ai {
                    background: #fa709a;
                    box-shadow: 0 0 8px #fa709a;
                }

                .map-cell.wall {
                    background: #fee140;
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                .pulse {
                    animation: pulse 2s infinite;
                }
            </style>
        `;
        
        document.body.appendChild(this.hudContainer);
    }

    createPlayerStats() {
        const statsPanel = document.createElement('div');
        statsPanel.className = 'glass-panel player-stats';
        statsPanel.innerHTML = `
            <div class="stat-item">
                <span>Current Player</span>
                <span class="stat-value" id="current-player">Human</span>
            </div>
            <div class="stat-item">
                <span>Human Walls</span>
                <span class="stat-value" id="human-walls">10</span>
            </div>
            <div class="stat-item">
                <span>AI Walls</span>
                <span class="stat-value" id="ai-walls">10</span>
            </div>
            <div class="stat-item">
                <span>Turn Count</span>
                <span class="stat-value" id="turn-count">1</span>
            </div>
            <div class="stat-item">
                <span>Game Mode</span>
                <span class="stat-value" id="game-mode">Movement</span>
            </div>
        `;
        
        this.hudContainer.appendChild(statsPanel);
        this.playerStats = statsPanel;
    }

    createGameControls() {
        const controlsPanel = document.createElement('div');
        controlsPanel.className = 'glass-panel game-controls';
        controlsPanel.innerHTML = `
            <button class="control-btn active" id="move-btn" data-mode="move">
                🚶 Move
            </button>
            <button class="control-btn" id="horizontal-btn" data-mode="horizontal">
                ➖ Horizontal Wall
            </button>
            <button class="control-btn" id="vertical-btn" data-mode="vertical">
                ➕ Vertical Wall
            </button>
            <button class="control-btn" id="auto-btn" data-mode="auto">
                🎯 Smart Wall
            </button>
        `;
        
        this.hudContainer.appendChild(controlsPanel);
        this.gameControls = controlsPanel;
        
        // Add event listeners
        this.setupControlEvents();
    }

    createNotificationSystem() {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.id = 'notification-container';
        this.hudContainer.appendChild(notificationContainer);
    }

    createMiniMap() {
        const miniMapPanel = document.createElement('div');
        miniMapPanel.className = 'glass-panel mini-map';
        
        const mapGrid = document.createElement('div');
        mapGrid.className = 'map-grid';
        
        // Create 9x9 grid
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.index = i;
            mapGrid.appendChild(cell);
        }
        
        miniMapPanel.appendChild(mapGrid);
        this.hudContainer.appendChild(miniMapPanel);
    }

    setupControlEvents() {
        const buttons = this.gameControls.querySelectorAll('.control-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                buttons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Dispatch custom event
                const mode = btn.dataset.mode;
                document.dispatchEvent(new CustomEvent('gameModeChange', { 
                    detail: { mode } 
                }));
                
                this.updateGameMode(mode);
            });
        });
    }

    updatePlayerStats(humanWalls, aiWalls, currentPlayer, turnCount) {
        document.getElementById('human-walls').textContent = humanWalls;
        document.getElementById('ai-walls').textContent = aiWalls;
        document.getElementById('current-player').textContent = currentPlayer;
        document.getElementById('turn-count').textContent = turnCount;
        
        // Add pulse effect to current player
        const currentPlayerElement = document.getElementById('current-player');
        currentPlayerElement.classList.add('pulse');
        setTimeout(() => currentPlayerElement.classList.remove('pulse'), 2000);
    }

    updateGameMode(mode) {
        const modeNames = {
            move: 'Movement',
            horizontal: 'Horizontal Wall',
            vertical: 'Vertical Wall',
            auto: 'Smart Wall'
        };
        
        document.getElementById('game-mode').textContent = modeNames[mode] || mode;
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.5s ease reverse';
            setTimeout(() => {
                container.removeChild(notification);
            }, 500);
        }, duration);
    }

    updateMiniMap(humanPos, aiPos, walls) {
        const cells = document.querySelectorAll('.map-cell');
        
        // Clear all special classes
        cells.forEach(cell => {
            cell.classList.remove('human', 'ai', 'wall');
        });
        
        // Set player positions
        const humanIndex = humanPos.y * 9 + humanPos.x;
        const aiIndex = aiPos.y * 9 + aiPos.x;
        
        if (cells[humanIndex]) cells[humanIndex].classList.add('human');
        if (cells[aiIndex]) cells[aiIndex].classList.add('ai');
        
        // Set walls (simplified representation)
        walls.horizontal.forEach(wallKey => {
            const [x, y] = wallKey.split(',').map(Number);
            const index = y * 9 + x;
            if (cells[index]) cells[index].classList.add('wall');
        });
        
        walls.vertical.forEach(wallKey => {
            const [x, y] = wallKey.split(',').map(Number);
            const index = y * 9 + x;
            if (cells[index]) cells[index].classList.add('wall');
        });
    }

    addAnimations() {
        // Add entrance animations
        const panels = this.hudContainer.querySelectorAll('.glass-panel');
        panels.forEach((panel, index) => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                panel.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
}

export default ModernHUD;