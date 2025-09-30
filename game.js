// Game State
let bossHealth = 10000;
let maxBossHealth = 10000;
let units = [];
let gameInterval;

// COMBO SYSTEM
let comboMeter = {
    archer: { count: 0, timer: null },
    mage: { count: 0, timer: null },
    tank: { count: 0, timer: null }
};

const comboBonuses = {
    archer: { name: "ARROW RAIN", damage: 150, emoji: "🌧️" },
    mage: { name: "METEOR STRIKE", damage: 200, emoji: "☄️" },
    tank: { name: "SHIELD BASH", damage: 100, emoji: "💥" }
};

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

// Summon Unit Function - WITH COMBO SYSTEM & ATTACK ANIMATION
function summonUnit(type) {
    const unit = unitTypes[type];
    
    // Create unit visual
    const unitId = createUnitVisual(type, unit.emoji);
    
    // Add battle log
    addLog(`🎁 ${unit.emoji} ${type.charAt(0).toUpperCase() + type.slice(1)} summoned!`);
    
    // COMBO SYSTEM TRACKING
    trackCombo(type);
    
    // ATTACK ANIMATION SEQUENCE
    setTimeout(() => {
        // SHOW ATTACK PROJECTILE
        showAttackProjectile(type, unitId);
        
        // Tunggu projectile sampai ke boss, baru apply damage
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
        }, 600); // Damage apply after projectile reach boss
    }, 1000);
}

// Remove Unit After Attack
function removeUnit(unitId) {
    const unitElement = document.getElementById(unitId);
    if (unitElement) {
        unitElement.style.opacity = '0';
        setTimeout(() => {
            unitElement.remove();
        }, 500);
    }
}

// ATTACK ANIMATION - Show Projectile
function showAttackProjectile(unitType, unitId) {
    const unitElement = document.getElementById(unitId);
    if (!unitElement) return;
    
    const battleField = document.getElementById('battle-field');
    const projectile = document.createElement('div');
    const projectileId = 'projectile-' + Date.now();
    
    // Get unit position
    const unitRect = unitElement.getBoundingClientRect();
    const battleRect = battleField.getBoundingClientRect();
    
    const startX = unitRect.left - battleRect.left + 20;
    const startY = unitRect.top - battleRect.top + 10;
    
    // Set projectile properties based on unit type
    const projectileData = getProjectileData(unitType);
    
    projectile.id = projectileId;
    projectile.className = 'projectile';
    projectile.textContent = projectileData.emoji;
    projectile.style.cssText = `
        position: absolute;
        left: ${startX}px;
        top: ${startY}px;
        font-size: ${projectileData.size}px;
        z-index: 10;
        animation: ${projectileData.animation} 0.5s linear forwards;
    `;
    
    battleField.appendChild(projectile);
    
    // Remove projectile after animation
    setTimeout(() => {
        const proj = document.getElementById(projectileId);
        if (proj) proj.remove();
    }, 500);
}

// PROJECTILE DATA FOR EACH UNIT TYPE
function getProjectileData(unitType) {
    const projectiles = {
        archer: { emoji: '🏹', size: 24, animation: 'arrowAttack' },
        mage: { emoji: '🔥', size: 28, animation: 'fireballAttack' },
        tank: { emoji: '🛡️', size: 32, animation: 'shieldAttack' }
    };
    return projectiles[unitType] || { emoji: '⭐', size: 20, animation: 'defaultAttack' };
}

// COMBO SYSTEM - Track Unit Combos
function trackCombo(unitType) {
    // Reset combo timer jika ada
    if (comboMeter[unitType].timer) {
        clearTimeout(comboMeter[unitType].timer);
    }
    
    // Increase combo count
    comboMeter[unitType].count++;
    
    // Show combo progress
    addLog(`🔸 ${unitTypes[unitType].emoji} Combo: ${comboMeter[unitType].count}/3`);
    
    // Check for combo achievement
    if (comboMeter[unitType].count >= 3) {
        activateCombo(unitType);
        comboMeter[unitType].count = 0; // Reset combo
    } else {
        // Set combo timer (10 seconds to complete combo)
        comboMeter[unitType].timer = setTimeout(() => {
            addLog(`💨 ${unitTypes[unitType].emoji} Combo reset!`);
            comboMeter[unitType].count = 0;
        }, 10000);
    }
}

// COMBO SYSTEM - Activate Special Attack
function activateCombo(unitType) {
    const combo = comboBonuses[unitType];
    
    // Apply combo damage
    bossHealth = Math.max(0, bossHealth - combo.damage);
    updateBossHealth();
    
    // Special effects log
    addLog(`🎇 ${combo.emoji} **${combo.name}** COMBO! ${combo.damage} DAMAGE!`);
    addLog(`💫 PERFECT COORDINATION! EPIC ATTACK!`);
    
    // Visual effect
    showComboEffect(unitType);
}

// COMBO SYSTEM - Visual Effect
function showComboEffect(unitType) {
    const battleField = document.getElementById('battle-field');
    const effect = document.createElement('div');
    effect.className = 'combo-effect';
    effect.textContent = comboBonuses[unitType].emoji + ' COMBO!';
    effect.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: gold;
        animation: comboGlow 1.5s ease-out;
        z-index: 100;
    `;
    
    battleField.appendChild(effect);
    
    // Remove effect after animation
    setTimeout(() => {
        effect.remove();
    }, 1500);
}

// Create Unit Visual
function createUnitVisual(type, emoji) {
    const battleField = document.getElementById('battle-field');
    const unitElement = document.createElement('div');
    
    const unitId = 'unit-' + Date.now();
    
    unitElement.className = 'unit';
    unitElement.id = unitId;
    unitElement.textContent = emoji;
    unitElement.style.left = (Math.random() * 200) + 'px';
    
    battleField.appendChild(unitElement);
    
    return unitId;
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
    
    // RESET COMBO SYSTEM JUGA
    for (let type in comboMeter) {
        comboMeter[type].count = 0;
        if (comboMeter[type].timer) {
            clearTimeout(comboMeter[type].timer);
        }
    }
    
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
