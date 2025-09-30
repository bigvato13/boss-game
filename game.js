// Game State
let bossHealth = 1000;
let maxBossHealth = 1000;
let units = [];
let gameInterval;

// Unit Types
const unitTypes = {
    archer: { emoji: '🎯', damage: 50, color: '#FF6B6B' },
    mage: { emoji: '🔥', damage: 75, color: '#4ECDC4' },
    tank: { emoji: '🛡️', damage: 30, color: '#45B7D1' }
};

// Initialize Game
function initGame() {
    updateBossHealth();
    addLog("🎮 Game started! Boss is waiting for challengers...");
}

// Summon Unit Function - ONE TIME ATTACK
function summonUnit(type) {
    const unit = unitTypes[type];
    
    // Create unit visual
    const unitId = createUnitVisual(type, unit.emoji);
    
    // Add battle log
    addLog(`🎁 ${unit.emoji} ${type.charAt(0).toUpperCase() + type.slice(1)} summoned!`);
    
    // ONE-TIME ATTACK after 1 second delay
    setTimeout(() => {
        // Apply damage
        bossHealth = Math.max(0, bossHealth - unit.damage);
        updateBossHealth();
        
        // Show attack message
        addLog(`⚔️ ${unit.emoji} dealt ${unit.damage} damage to boss!`);
        
        // Remove unit after attack
        removeUnit(unitId);
        
        // Check if boss defeated
        if (bossHealth <= 0) {
            bossDefeated();
        }
    }, 1000);
}

// Create Unit Visual
function createUnitVisual(type, emoji) {
    const battleField = document.getElementById('battle-field');
    const unitElement = document.createElement('div');
    
    unitElement.className = 'unit';
    unitElement.textContent = emoji;
    unitElement.style.left = (Math.random() * 100) + 'px';
    unitElement.style.animationDelay = (Math.random() * 0.5) + 's';
    
    battleField.appendChild(unitElement);
    
    // Remove old units if too many
    const allUnits = battleField.getElementsByClassName('unit');
    if (allUnits.length > 8) {
        battleField.removeChild(allUnits[0]);
    }
}

// Start Combat System
function startCombat() {
    gameInterval = setInterval(() => {
        if (units.length === 0) return;
        
        // Calculate total damage
        let totalDamage = units.reduce((sum, unit) => sum + unit.damage, 0);
        
        // Apply damage to boss
        bossHealth = Math.max(0, bossHealth - totalDamage);
        
        // Update display
        updateBossHealth();
        
        // Check if boss defeated
        if (bossHealth <= 0) {
            bossDefeated();
        }
    }, 1000);
}

// Update Boss Health Display
function updateBossHealth() {
    const healthPercent = (bossHealth / maxBossHealth) * 100;
    const healthBar = document.getElementById('boss-health');
    const healthText = document.getElementById('health-text');
    
    healthBar.style.width = healthPercent + '%';
    healthText.textContent = bossHealth;
    
    // Change color based on health
    if (healthPercent < 25) {
        healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff6b6b)';
    } else if (healthPercent < 50) {
        healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ffa726)';
    }
}

// Boss Defeated
function bossDefeated() {
    clearInterval(gameInterval);
    gameInterval = null;
    
    addLog("🎉 🎉 🎉 BOSS DEFEATED! VICTORY! 🎉 🎉 🎉");
    addLog("🔄 Game will reset in 5 seconds...");
    
    // Show celebration
    document.getElementById('boss-image').textContent = '💀 DEFEATED';
    
    setTimeout(resetGame, 5000);
}

// Reset Game
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    
    bossHealth = maxBossHealth;
    units = [];
    
    // Clear battle field
    document.getElementById('battle-field').innerHTML = '<p>Units will appear here...</p>';
    document.getElementById('boss-image').textContent = '👹 BOSS';
    document.getElementById('log').innerHTML = '';
    
    updateBossHealth();
    addLog("🔄 Game reset! Boss is back with full health!");
}

// Add Log Entry
function addLog(message) {
    const log = document.getElementById('log');
    const logEntry = document.createElement('div');
    
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    
    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;
}

// Initialize game when page loads
window.onload = initGame;
