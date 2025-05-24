class ModernHUD {
    constructor() {
        this.hudContainer = null;
        this.isInitialized = false;
        this.isMobile = this.detectMobile();

        this.init();
    }

    detectMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        this.createGlobalStyles();
        this.createHUDContainer();
        this.createTopBar();
        this.createGameArea();
        this.createBottomControls();

        this.createGameOverlay();
        this.setupResponsiveHandlers();
        this.addEntranceAnimations();
        this.isInitialized = true;
    }

    createGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Global Reset and Variables */
            :root {
                --primary-blue: #4facfe;
                --primary-pink: #fa709a;
                --accent-cyan: #00f2fe;
                --accent-yellow: #fee140;
                --dark-bg: #0a0a0a;
                --glass-bg: rgba(255, 255, 255, 0.08);
                --glass-border: rgba(255, 255, 255, 0.15);
                --text-primary: #ffffff;
                --text-secondary: #b8b8b8;
                --success: #4ade80;
                --warning: #facc15;
                --error: #ef4444;
                --border-radius: 16px;
                --spacing-xs: 4px;
                --spacing-sm: 8px;
                --spacing-md: 16px;
                --spacing-lg: 24px;
                --spacing-xl: 32px;
                --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
                --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
                --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            * {
                box-sizing: border-box;
            }

            /* HUD Container */
            #professional-hud {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                color: var(--text-primary);
                display: grid;
                grid-template-rows: auto 1fr auto;
                padding: var(--spacing-md);
                gap: var(--spacing-md);
            }

            /* Glass Morphism Component */
            .glass {
                background: var(--glass-bg);
                backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                transition: var(--transition);
                pointer-events: auto;
            }

            .glass:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            /* Top Bar - Game Stats */
            .top-bar {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                align-items: center;
                padding: var(--spacing-md) var(--spacing-lg);
                gap: var(--spacing-lg);
            }

            .player-info {
                display: flex;
                align-items: center;
                gap: var(--spacing-md);
            }

            .player-info.human {
                justify-self: start;
            }

            .player-info.ai {
                justify-self: end;
                flex-direction: row-reverse;
            }

            .player-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: bold;
                position: relative;
                transition: var(--transition);
            }

            .player-avatar.human {
                background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
                box-shadow: 0 0 20px rgba(79, 172, 254, 0.5);
            }

            .player-avatar.ai {
                background: linear-gradient(135deg, var(--primary-pink), var(--accent-yellow));
                box-shadow: 0 0 20px rgba(250, 112, 154, 0.5);
            }

            .player-avatar.active {
                animation: pulse 2s infinite;
                transform: scale(1.1);
            }

            .player-stats {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-xs);
            }

            .player-name {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
            }

            .player-walls {
                font-size: 14px;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }

            .wall-dots {
                display: flex;
                gap: 2px;
            }

            .wall-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--accent-yellow);
                transition: var(--transition);
            }

            .wall-dot.used {
                background: var(--text-secondary);
                opacity: 0.3;
            }

            /* Center Info */
            .center-info {
                text-align: center;
                padding: var(--spacing-sm);
            }

            .turn-counter {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); 
        }
            .game-mode {
                font-size: 12px;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Game Area - Mini Map */
            .game-area {
                display: flex;
                justify-content: flex-end;
                align-items: flex-start;
                padding: var(--spacing-md);
            }

            .mini-map {
                width: 200px;
                height: 200px;
                padding: var(--spacing-md);
            }

            .mini-map-grid {
                width: 100%;
                height: 100%;
                display: grid;
                grid-template-columns: repeat(9, 1fr);
                grid-template-rows: repeat(9, 1fr);
                gap: 1px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid var(--glass-border);
            }

            .map-cell {
                background: rgba(255, 255, 255, 0.02);
                transition: var(--transition);
                position: relative;
            }

            .map-cell.human {
                background: var(--primary-blue);
                box-shadow: 0 0 8px var(--primary-blue);
                animation: mapPulse 2s infinite;
            }

            .map-cell.ai {
                background: var(--primary-pink);
                box-shadow: 0 0 8px var(--primary-pink);
                animation: mapPulse 2s infinite;
            }

            .map-cell.wall {
                background: var(--accent-yellow);
                opacity: 0.8;
            }

            /* Bottom Controls */
            .bottom-controls {
                display: flex;
                justify-content: center;
                padding: var(--spacing-lg);
            }

            .controls-container {
                display: flex;
                gap: var(--spacing-md);
                padding: var(--spacing-md);
                border-radius: calc(var(--border-radius) + 8px);
            }

            .control-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--spacing-sm);
                padding: var(--spacing-md) var(--spacing-lg);
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                border: 1px solid var(--glass-border);
                border-radius: var(--border-radius);
                color: var(--text-primary);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                position: relative;
                overflow: hidden;
                min-width: 80px;
                text-align: center;
                user-select: none;
            }

            .control-button:hover {
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: var(--shadow-lg);
            }

            .control-button:active {
                transform: translateY(0);
            }

            .control-button.active {
                background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
                border-color: var(--primary-blue);
                box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
            }

            .control-button.active::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                animation: shimmer 2s infinite;
            }

            .control-icon {
                font-size: 24px;
                line-height: 1;
            }

            .control-label {
                font-size: 12px;
                line-height: 1;
                white-space: nowrap;
            }

           
            /* Game Overlay for Modals */
            .game-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                z-index: 2000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-lg);
            }

            .modal {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: calc(var(--border-radius) * 2);
                padding: var(--spacing-xl);
                max-width: 400px;
                width: 100%;
                text-align: center;
                animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .modal-title {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: var(--spacing-md);
                background: linear-gradient(135deg, var(--primary-blue), var(--primary-pink));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .modal-content {
                color: var(--text-secondary);
                margin-bottom: var(--spacing-lg);
                line-height: 1.6;
            }

            .modal-buttons {
                display: flex;
                gap: var(--spacing-md);
                justify-content: center;
            }

            .modal-button {
                padding: var(--spacing-md) var(--spacing-lg);
                border: none;
                border-radius: var(--border-radius);
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                min-width: 100px;
            }

            .modal-button.primary {
                background: linear-gradient(135deg, var(--primary-blue), var(--accent-cyan));
                color: white;
            }

            .modal-button.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                border: 1px solid var(--glass-border);
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
                #professional-hud {
                    padding: var(--spacing-sm);
                    gap: var(--spacing-sm);
                }

                .top-bar {
                    padding: var(--spacing-sm) var(--spacing-md);
                    gap: var(--spacing-md);
                    grid-template-columns: 1fr auto 1fr;
                }

                .player-avatar {
                    width: 40px;
                    height: 40px;
                    font-size: 16px;
                }

                .player-name {
                    font-size: 14px;
                }

                .player-walls {
                    font-size: 12px;
                }

                .turn-counter {
                    font-size: 20px;
                }

                .mini-map {
                    width: 150px;
                    height: 150px;
                    padding: var(--spacing-sm);
                }

                .controls-container {
                    gap: var(--spacing-sm);
                    padding: var(--spacing-sm);
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .control-button {
                    min-width: 70px;
                    padding: var(--spacing-sm) var(--spacing-md);
                }

                .control-icon {
                    font-size: 20px;
                }

                .control-label {
                    font-size: 11px;
                }

              
            }

            @media (max-width: 480px) {
                .top-bar {
                    grid-template-columns: 1fr;
                    gap: var(--spacing-sm);
                    text-align: center;
                }

                .player-info {
                    justify-self: center !important;
                    flex-direction: row !important;
                }

                .center-info {
                    order: -1;
                }

                .game-area {
                    justify-content: center;
                }

                .controls-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-sm);
                    width: 100%;
                    max-width: 300px;
                }
            }

            /* Animations */
            @keyframes pulse {
                0%, 100% { transform: scale(1.1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
            }

            @keyframes mapPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
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

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes scaleIn {
                from {
                    transform: scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes fadeInUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .fade-in-up {
                animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
    }

    createHUDContainer() {
        this.hudContainer = document.createElement('div');
        this.hudContainer.id = 'professional-hud';
        document.body.appendChild(this.hudContainer);
    }

    createTopBar() {
        const topBar = document.createElement('div');
        topBar.className = 'glass top-bar';
        topBar.innerHTML = `
            <div class="player-info human">
                <div class="player-avatar human active" id="human-avatar">👤</div>
                <div class="player-stats">
                    <h3 class="player-name">Human</h3>
                    <div class="player-walls">
                        <span>Walls: </span>
                        <div class="wall-dots" id="human-wall-dots"></div>
                    </div>
                </div>
            </div>
            
            <div class="center-info">
                <div class="turn-counter" id="turn-counter">Turn 1</div>
                
            </div>
            
            <div class="player-info ai">
                <div class="player-avatar ai" id="ai-avatar">🤖</div>
                <div class="player-stats">
                    <h3 class="player-name">AI</h3>
                    <div class="player-walls">
                        <span>Walls: </span>
                        <div class="wall-dots" id="ai-wall-dots"></div>
                    </div>
                </div>
            </div>
        `;

        this.hudContainer.appendChild(topBar);
        this.initializeWallDots();
    }

    createGameArea() {
        const gameArea = document.createElement('div');
        gameArea.className = 'game-area';
        gameArea.innerHTML = `
            <div class="glass mini-map">
                <div class="mini-map-grid" id="mini-map-grid"></div>
            </div>
        `;

        this.hudContainer.appendChild(gameArea);
        this.initializeMiniMap();
    }

    createBottomControls() {
        const bottomControls = document.createElement('div');
        bottomControls.className = 'bottom-controls';
        bottomControls.innerHTML = `
            <div class="glass controls-container">
                <button class="control-button active" id="move-btn" data-mode="move">
                    <div class="control-icon">🚶</div>
                    <div class="control-label">Move</div>
                </button>
                <button class="control-button" id="horizontal-btn" data-mode="horizontal">
                    <div class="control-icon">➖</div>
                    <div class="control-label">H-Wall</div>
                </button>
                <button class="control-button" id="vertical-btn" data-mode="vertical">
                    <div class="control-icon">➕</div>
                    <div class="control-label">V-Wall</div>
                </button>
                <button class="control-button" id="auto-btn" data-mode="auto">
                    <div class="control-icon">🎯</div>
                    <div class="control-label">Smart</div>
                </button>
            </div>
        `;

        this.hudContainer.appendChild(bottomControls);
        this.setupControlEvents();
    }



    createGameOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.id = 'game-overlay';
        overlay.innerHTML = `
            <div class="modal">
                <h2 class="modal-title" id="modal-title">Game Over</h2>
                <div class="modal-content" id="modal-content">
                    Congratulations! You won the game.
                </div>
                <div class="modal-buttons">
                    <button class="modal-button primary" id="restart-btn">Play Again</button>
                    <button class="modal-button secondary" id="menu-btn">Main Menu</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    initializeWallDots() {
        const humanDots = document.getElementById('human-wall-dots');
        const aiDots = document.getElementById('ai-wall-dots');

        for (let i = 0; i < 10; i++) {
            const humanDot = document.createElement('div');
            humanDot.className = 'wall-dot';
            humanDot.dataset.index = i;
            humanDots.appendChild(humanDot);

            const aiDot = document.createElement('div');
            aiDot.className = 'wall-dot';
            aiDot.dataset.index = i;
            aiDots.appendChild(aiDot);
        }
    }

    initializeMiniMap() {
        const grid = document.getElementById('mini-map-grid');
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.index = i;
            grid.appendChild(cell);
        }
    }

    setupControlEvents() {
        const buttons = document.querySelectorAll('.control-button');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {

                buttons.forEach(b => b.classList.remove('active'));


                btn.classList.add('active');

                const mode = btn.dataset.mode;
                document.dispatchEvent(new CustomEvent('gameModeChange', {
                    detail: { mode }
                }));

                this.updateGameMode(mode);
            });
        });
    }

    setupResponsiveHandlers() {
        window.addEventListener('resize', () => {
            this.isMobile = this.detectMobile();
        });
    }

    addEntranceAnimations() {
        const elements = this.hudContainer.querySelectorAll('.glass');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';

            setTimeout(() => {
                element.classList.add('fade-in-up');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }


    updatePlayerStats(humanWalls, aiWalls, currentPlayer, turnCount) {

        document.getElementById('turn-counter').textContent = `Turn ${turnCount}`;


        this.updateWallDots('human', humanWalls);
        this.updateWallDots('ai', aiWalls);


        document.getElementById('human-avatar').classList.toggle('active', currentPlayer === 'Human');
        document.getElementById('ai-avatar').classList.toggle('active', currentPlayer === 'AI');
    }

    updateWallDots(player, wallsLeft) {
        const dots = document.querySelectorAll(`#${player}-wall-dots .wall-dot`);
        dots.forEach((dot, index) => {
            dot.classList.toggle('used', index >= wallsLeft);
        });
    }

    updateGameMode(mode) {
        const modeNames = {
            move: 'Movement Mode',
            horizontal: 'Horizontal Wall',
            vertical: 'Vertical Wall',
            auto: 'Smart Wall'
        };

        document.getElementById('current-mode').textContent = modeNames[mode] || mode;
    }

    updateMiniMap(humanPos, aiPos, walls) {
        const cells = document.querySelectorAll('.map-cell');


        cells.forEach(cell => {
            cell.classList.remove('human', 'ai', 'wall');
        });


        const humanIndex = humanPos.y * 9 + humanPos.x;
        const aiIndex = aiPos.y * 9 + aiPos.x;

        if (cells[humanIndex]) cells[humanIndex].classList.add('human');
        if (cells[aiIndex]) cells[aiIndex].classList.add('ai');


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



    showGameOver(winner, onRestart, onMenu) {
        const overlay = document.getElementById('game-overlay');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');

        title.textContent = winner === 'Human' ? '🎉 Victory!' : '🤖 AI Wins!';
        content.textContent = winner === 'Human'
            ? 'Congratulations! You have successfully reached the opposite side and won the game!'
            : 'The AI has outmaneuvered you this time. Better luck next round!';

        document.getElementById('restart-btn').onclick = onRestart;
        document.getElementById('menu-btn').onclick = onMenu;

        overlay.style.display = 'flex';
    }

    hideGameOver() {
        document.getElementById('game-overlay').style.display = 'none';
    }
}

export default ModernHUD;