const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let money = 500;
let lives = 20;
let wave = 0;
let enemies = [];
let towers = [];
let projectiles = [];
let currentMap = null;
let selectedTowerType = null;
let selectedTower = null;
let isWaveActive = false;
let spawning = false;
let mouseX = 0;
let mouseY = 0;

function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}

// UI Elements
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const moneyEl = document.getElementById('money');
const livesEl = document.getElementById('lives');
const waveEl = document.getElementById('wave');
const upgradePanel = document.getElementById('upgrade-panel');
const upgradeButton = document.getElementById('upgrade-button');
const upgradeCostEl = document.getElementById('upgrade-cost');
const sellPriceEl = document.getElementById('sell-price');
const towerNameEl = document.getElementById('tower-name');
const towerStatsEl = document.getElementById('tower-stats');
const wavePreviewEl = document.getElementById('wave-preview');
const cancelPlacementBtn = document.getElementById('cancel-placement');
const autoWaveCheck = document.getElementById('auto-wave-check');
function startGame(mapIndex) {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    currentMap = new GameMap(mapIndex);
    resetGame();
    updateWavePreview();
}

function backToMenu() {
    gameContainer.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    currentMap = null;
    resetGame();
}

function updateWavePreview() {
    const nextWave = wave + 1;
    let waveData;
    if (nextWave <= WAVE_DEFINITIONS.length) {
        waveData = WAVE_DEFINITIONS[nextWave - 1];
    } else {
        waveData = getEndlessWave(nextWave);
    }
    
    let preview = `Wave ${nextWave}: `;
    preview += waveData.zombies.map(z => `${z.count}x ${ZOMBIE_TYPES[z.type].name}`).join(', ');
    wavePreviewEl.textContent = preview;
}

function updateUI() {
    moneyEl.textContent = money;
    livesEl.textContent = lives;
    waveEl.textContent = wave;

    // Show/hide cancel button
    if (selectedTowerType) {
        cancelPlacementBtn.classList.remove('hidden');
    } else {
        cancelPlacementBtn.classList.add('hidden');
    }

    // Update shop buttons with affordability
    document.querySelectorAll('.shop-item').forEach(btn => {
        const type = btn.onclick.toString().match(/selectTower\('(\w+)'\)/);
        if (type) {
            const cost = TOWER_TYPES[type[1]].cost;
            btn.disabled = money < cost;
        }
    });

    if (selectedTower) {
        upgradePanel.classList.remove('hidden');
        towerNameEl.innerHTML = `${selectedTower.name} <span style="font-size: 0.8em; opacity: 0.7;">(Lvl ${selectedTower.level})</span>`;
        towerStatsEl.textContent = `Dmg: ${selectedTower.damage} | Spd: ${(60/selectedTower.fireRate).toFixed(1)}/s | Range: ${selectedTower.range}`;
        
        const cost = selectedTower.getUpgradeCost();
        if (cost !== null) {
            upgradeButton.disabled = money < cost;
            upgradeCostEl.textContent = cost;
        } else {
            upgradeButton.disabled = true;
            upgradeCostEl.textContent = "MAX";
        }
        sellPriceEl.textContent = Math.floor(selectedTower.totalInvested * 0.7);
    } else {
        upgradePanel.classList.add('hidden');
    }
}

function loadMap(index) {
    currentMap = new GameMap(index);
    resetGame();
}

function resetGame() {
    enemies = [];
    towers = [];
    projectiles = [];
    money = 500;
    lives = 20;
    wave = 0;
    isWaveActive = false;
    spawning = false;
    selectedTower = null;
    updateUI();
    if (currentMap) updateWavePreview();
}

function selectTower(type) {
    selectedTowerType = type;
    selectedTower = null;
    updateUI();
}

function deselectTower() {
    selectedTower = null;
    selectedTowerType = null;
    updateUI();
}

function upgradeSelectedTower() {
    if (selectedTower) {
        const cost = selectedTower.getUpgradeCost();
        if (cost !== null && money >= cost) {
            money -= cost;
            selectedTower.upgrade();
            updateUI();
        }
    }
}

function sellSelectedTower() {
    if (selectedTower) {
        money += Math.floor(selectedTower.totalInvested * 0.7);
        towers = towers.filter(t => t !== selectedTower);
        selectedTower = null;
        updateUI();
    }
}

canvas.addEventListener('mousedown', (e) => {
    const { x, y } = getCanvasCoords(e);

    // Check if clicked on existing tower
    const clickedTower = towers.find(t => 
        Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2)) < t.radius * 1.5 // Increased hitbox
    );

    if (clickedTower) {
        selectedTower = clickedTower;
        selectedTowerType = null;
    } else if (selectedTowerType && currentMap) {
        const cost = TOWER_TYPES[selectedTowerType].cost;
        if (money >= cost && !currentMap.isNearPath(x, y)) {
            // Check if place is occupied
            const occupied = towers.some(t => 
                Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2)) < t.radius * 2
            );
            if (!occupied) {
                towers.push(new Tower(selectedTowerType, x, y));
                money -= cost;
            }
        }
    } else {
        selectedTower = null;
    }
    updateUI();
});

canvas.addEventListener('mousemove', (e) => {
    const coords = getCanvasCoords(e);
    mouseX = coords.x;
    mouseY = coords.y;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        deselectTower();
    }
});

function startWave() {
    if (isWaveActive || !currentMap) return;
    
    isWaveActive = true;
    spawning = true;
    wave++;
    updateUI();

    // Get wave definition
    let waveData;
    if (wave <= WAVE_DEFINITIONS.length) {
        waveData = WAVE_DEFINITIONS[wave - 1];
    } else {
        waveData = getEndlessWave(wave);
    }

    // Build spawn queue
    const spawnQueue = [];
    for (const group of waveData.zombies) {
        for (let i = 0; i < group.count; i++) {
            spawnQueue.push(group.type);
        }
    }
    
    // Shuffle for variety
    for (let i = spawnQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }

    // Spawn enemies with delay
    let spawnIndex = 0;
    const hpMultiplier = waveData.hpMultiplier || 1;
    const spawnDelay = Math.max(200, 800 - wave * 30);
    const spawnInterval = setInterval(() => {
        if (spawnIndex < spawnQueue.length) {
            enemies.push(new Enemy(spawnQueue[spawnIndex], currentMap.path, hpMultiplier));
            spawnIndex++;
        } else {
            clearInterval(spawnInterval);
            spawning = false;
        }
    }, spawnDelay);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!currentMap) return;

    // Update enemies (iterate backwards to safely remove)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        if (enemy.finished) {
            lives--;
            enemies.splice(i, 1);
            if (lives <= 0) {
                alert(`Game Over! You survived ${wave} waves.\nZombies reached the city!`);
                backToMenu();
                return;
            }
        } else if (enemy.isDead) {
            money += enemy.reward;
            enemies.splice(i, 1);
        }
    }

    // Update towers
    towers.forEach(tower => tower.update(enemies, projectiles));

    // Update projectiles (iterate backwards)
    for (let i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].update(enemies);
        if (projectiles[i].isDead) projectiles.splice(i, 1);
    }

    // Check if wave finished
    if (isWaveActive && !spawning && enemies.length === 0) {
        isWaveActive = false;
        // Bonus money for completing wave
        const bonus = wave * 10;
        money += bonus;
        updateWavePreview();

        // Auto-wave functionality
        if (autoWaveCheck && autoWaveCheck.checked) {
            setTimeout(startWave, 1000);
        }
    }

    updateUI();
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (!currentMap) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Select a Map to Start", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        return;
    }

    currentMap.draw(ctx);
    
    enemies.forEach(enemy => enemy.draw(ctx));
    towers.forEach(tower => tower.draw(ctx, tower === selectedTower));
    projectiles.forEach(proj => proj.draw(ctx));

    // Draw placement preview
    if (selectedTowerType && !selectedTower) {
        const stats = TOWER_TYPES[selectedTowerType];
        ctx.globalAlpha = 0.5;
        
        // Draw range
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, stats.range, 0, Math.PI * 2);
        ctx.fill();

        // Draw tower preview
        ctx.fillStyle = stats.color;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Warning if on path
        if (currentMap.isNearPath(mouseX, mouseY)) {
            ctx.fillStyle = "rgba(231, 76, 60, 0.5)";
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 20, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
    }
}

// Start game loop (menu is shown by default)
gameLoop();
