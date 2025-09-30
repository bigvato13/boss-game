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

// EVOLUTION SYSTEM
let evolutionLevel = {
    archer: { stage: 1, count: 0 },
    mage: { stage: 1, count: 0 },
    tank: { stage: 1, count: 0 }
};

const comboBonuses = {
    archer: { name: "ARROW RAIN", damage: 150, emoji: "🌧️" },
    mage: { name: "METEOR STRIKE", damage: 200, emoji: "☄️" },
    tank: { name: "SHIELD BASH", damage: 100, emoji: "💥" }
};

// Unit Types dengan Evolution Data
const unitTypes = {
    archer: { 
        emoji: '🎯', 
        damage: 50, 
        color: '#FF6B6B',
        evolution: {
            stage1: { emoji: '🎯', damage: 50, name: 'Archer' },
            stage2: { emoji: '🏹', damage: 80, name: 'Crossbow', ability: 'Piercing Shot' },
            stage3: { emoji: '💣', damage: 120, name: 'Cannon', ability: 'Explosive Arrow' }
        }
    },
    mage: { 
        emoji: '🔥', 
        damage: 75, 
        color: '#4ECDC4',
        evolution: {
            stage1: { emoji: '🔥', damage: 75, name: 'Mage' },
            stage2: { emoji: '🧙', damage: 110, name: 'Wizard', ability: 'Fireball' },
            stage3: { emoji: '🌟', damage: 160, name: 'Archmage', ability: 'Meteor Shower' }
        }
    },
    tank: { 
        emoji: '🛡️', 
        damage: 30, 
        color: '#45B7D1',
        evolution: {
            stage1: { emoji: '🛡️', damage: 30, name: 'Tank' },
            stage2: { emoji: '⚔️', damage: 50, name: 'Knight', ability: 'Shield Bash' },
            stage3: { emoji: '🛡️✨', damage: 80, name: 'Guardian', ability: 'Aura Protection' }
        }
    }
};

// Initialize Game
function initGame() {
    updateBossHealth();
    updateProgressBars();
    addLog("🎮 Game started! Boss is waiting for challengers...");
}

// Summon Unit Function - WITH EVOLUTION & COMBO SYSTEM
function summonUnit(type) {
    const currentStage = getCurrentEvolutionStage(type);
    const unit = currentStage;
    
    // Create unit visual dengan stage betul
    const unitId = createUnitVisual(type, unit.emoji);
    
    // Add battle log dengan evolution stage
    addLog(`🎁 ${unit.emoji} Lv.${evolutionLevel[type].stage} ${unit.name} summoned!`);
    
    // EVOLUTION TRACKING
    trackEvolution(type);
    
    // COMBO SYSTEM TRACKING
    trackCombo(type);
    
    // UPDATE PROGRESS BARS
    updateProgressBars();
    
    // ATTACK ANIMATION SEQUENCE
    setTimeout(() => {
        // SHOW ATTACK PROJECTILE (dengan evolution stage)
        showAttackProjectile(type, unitId, evolutionLevel[type].stage);
        
        // Tunggu projectile sampai ke boss, baru apply damage
        setTimeout(() => {
            // Apply damage (dengan evolution damage)
            bossHealth = Math.max(0, bossHealth - unit.damage);
            updateBossHealth();
            
            // BOSS HIT ANIMATION
            showBossHitAnimation();
            
            // Show attack message dengan evolution info
            addLog(`⚔️ ${unit.emoji} dealt ${unit.damage} damage to boss!`);
            
            // Remove unit after attack
            removeUnit(unitId);
            
            // Check if boss defeated
            if (bossHealth <= 0) {
                bossDefeated();
            }
        }, 600);
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
function showAttackProjectile(unitType, unitId, evolutionStage) {
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
    
    // Set projectile properties based on unit type dan evolution stage
    const projectileData = getProjectileData(unitType, evolutionStage);
    
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

// PROJECTILE DATA FOR EACH UNIT TYPE & EVOLUTION STAGE
function getProjectileData(unitType, evolutionStage) {
    const projectiles = {
        archer: [
            { emoji: '🏹', size: 24, animation: 'arrowAttack' },
            { emoji: '🏹', size: 28, animation: 'arrowAttack' },
            { emoji: '💣', size: 32, animation: 'fireballAttack' }
        ],
        mage: [
            { emoji: '🔥', size: 24, animation: 'fireballAttack' },
            { emoji: '🔮', size: 28, animation: 'fireballAttack' },
            { emoji: '🌟', size: 32, animation: 'fireballAttack' }
        ],
        tank: [
            { emoji: '🛡️', size: 24, animation: 'shieldAttack' },
            { emoji: '⚔️', size: 28, animation: 'shieldAttack' },
            { emoji: '🛡️✨', size: 32, animation: 'shieldAttack' }
        ]
    };
    
    const stageIndex = evolutionStage - 1;
    return projectiles[unitType][stageIndex] || { emoji: '⭐', size: 20, animation: 'defaultAttack' };
}

// BOSS HIT ANIMATION
function showBossHitAnimation() {
    const bossImage = document.getElementById('boss-image');
    if (!bossImage) return;
    
    // Add hit class
    bossImage.classList.add('boss-hit');
    
    // Create hit effect particles
    createHitParticles();
    
    // Remove hit class after animation
    setTimeout(() => {
        bossImage.classList.remove('boss-hit');
    }, 500);
}

// HIT PARTICLE EFFECTS
function createHitParticles() {
    const bossContainer = document.getElementById('boss-container');
    if (!bossContainer) return;
    
    const particles = ['💥', '✨', '⭐', '🔥', '💫', '🌟'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: 20px;
                pointer-events: none;
                z-index: 15;
                animation: hitParticle 1s ease-out forwards;
            `;
            
            // Position around boss
            const bossRect = bossContainer.getBoundingClientRect();
            const battleRect = document.getElementById('battle-field').getBoundingClientRect();
            
            const startX = bossRect.left - battleRect.left - 20;
            const startY = bossRect.top - battleRect.top + 40;
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            // Random movement
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 80;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            particle.style.setProperty('--end-x', endX + 'px');
            particle.style.setProperty('--end-y', endY + 'px');
            
            document.getElementById('battle-field').appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }, i * 80);
    }
}

// EVOLUTION SYSTEM - Get Current Stage
function getCurrentEvolutionStage(unitType) {
    const stages = unitTypes[unitType].evolution;
    const currentStage = evolutionLevel[unitType].stage;
    
    switch(currentStage) {
        case 1: return stages.stage1;
        case 2: return stages.stage2;
        case 3: return stages.stage3;
        default: return stages.stage1;
    }
}

// EVOLUTION SYSTEM - Track Evolution Progress
function trackEvolution(unitType) {
    evolutionLevel[unitType].count++;
    
    // Check if ready to evolve
    if (evolutionLevel[unitType].count >= 5 && evolutionLevel[unitType].stage < 3) {
        evolveUnit(unitType);
    }
    
    // Show evolution progress in log
    const progress = evolutionLevel[unitType].count;
    const stage = evolutionLevel[unitType].stage;
    addLog(`📈 ${unitTypes[unitType].emoji} Evolution: ${progress}/5 (Stage ${stage})`);
    
    // Update progress bars
    updateProgressBars();
}

// EVOLUTION SYSTEM - Evolve Unit Type
function evolveUnit(unitType) {
    evolutionLevel[unitType].stage++;
    evolutionLevel[unitType].count = 0;
    
    const newStage = evolutionLevel[unitType].stage;
    const unitData = unitTypes[unitType].evolution;
    
    let message = "";
    let newUnit = null;
    
    if (newStage === 2) {
        newUnit = unitData.stage2;
        message = `🆙 **EVOLUTION!** ${unitData.stage1.emoji} → ${newUnit.emoji} ${newUnit.name}!`;
    } else if (newStage === 3) {
        newUnit = unitData.stage3;
        message = `🚀 **ULTIMATE EVOLUTION!** ${unitData.stage2.emoji} → ${newUnit.emoji} ${newUnit.name}!`;
    }
    
    if (newUnit && newUnit.ability) {
        message += ` Ability: ${newUnit.ability}!`;
    }
    
    addLog(message);
    addLog(`💪 Damage increased! New power: ${newUnit.damage}`);
    
    // Visual evolution effect
    showEvolutionEffect(unitType, newStage);
    
    // Update progress bars
    updateProgressBars();
}

// EVOLUTION SYSTEM - Visual Effect
function showEvolutionEffect(unitType, newStage) {
    const battleField = document.getElementById('battle-field');
    const effect = document.createElement('div');
    
    const unitData = unitTypes[unitType].evolution;
    const newUnit = newStage === 2 ? unitData.stage2 : unitData.stage3;
    
    effect.className = 'evolution-effect';
    effect.textContent = `${unitData.stage1.emoji}→${newUnit.emoji}`;
    effect.style.cssText = `
        position: absolute;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 46px;
        font-weight: bold;
        color: #FFD700;
        text-shadow: 0 0 15px #FF6B00, 0 0 30px #FF8C00, 0 0 45px #FFA500;
        animation: evolutionGlow 2s ease-out;
        z-index: 90;
    `;
    
    battleField.appendChild(effect);
    
    // Remove effect after animation
    setTimeout(() => {
        effect.remove();
    }, 2000);
}

// PROGRESS BARS SYSTEM - Update All Progress Bars
function updateProgressBars() {
    updateProgressBar('archer', evolutionLevel.archer.count, evolutionLevel.archer.stage);
    updateProgressBar('mage', evolutionLevel.mage.count, evolutionLevel.mage.stage);
    updateProgressBar('tank', evolutionLevel.tank.count, evolutionLevel.tank.stage);
}

// PROGRESS BARS SYSTEM - Update Individual Progress Bar
function updateProgressBar(unitType, count, stage) {
    const progressFill = document.getElementById(`${unitType}-progress`);
    const progressText = document.getElementById(`${unitType}-text`);
    
    if (!progressFill || !progressText) return;
    
    let progressPercent = 0;
    let displayText = '';
    
    if (stage >= 3) {
        // Already at max evolution
        progressPercent = 100;
        displayText = 'MAX';
        progressFill.style.background = 'linear-gradient(90deg, #FFD700, #FF6B00)';
    } else {
        // Calculate progress to next evolution
        progressPercent = (count / 5) * 100;
        displayText = `${count}/5`;
        
        // Change color based on progress
        if (progressPercent < 50) {
            progressFill.style.background = 'linear-gradient(90deg, #FF6B6B, #FF8E8E)';
        } else if (progressPercent < 80) {
            progressFill.style.background = 'linear-gradient(90deg, #4ECDC4, #6BE0D9)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #45B7D1, #67C7E0)';
        }
    }
    
    progressFill.style.width = progressPercent + '%';
    progressText.textContent = displayText;
    
    // Add pulse animation when almost evolved
    if (count >= 4 && stage < 3) {
        progressFill.style.animation = 'progressPulse 1s infinite';
    } else {
        progressFill.style.animation = 'none';
    }
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
    
    // BOSS HIT ANIMATION untuk combo
    showBossHitAnimation();
    
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
        font-size: 56px;
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
    } else {
        healthBar.style.background = 'linear-gradient(90deg, #ff0000, #ff6b6b, #4CAF50)';
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
    document.getElementById('boss-image').style.animation = 'none';
    document.getElementById('boss-image').style.filter = 'grayscale(1) brightness(0.5)';
    
    // Victory particles
    createVictoryParticles();
    
    setTimeout(resetGame, 5000);
}

// VICTORY PARTICLE EFFECTS
function createVictoryParticles() {
    const battleField = document.getElementById('battle-field');
    const particles = ['🎉', '✨', '🌟', '💫', '🎊', '⭐'];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: 24px;
                pointer-events: none;
                z-index: 20;
                animation: victoryParticle 2s ease-out forwards;
            `;
            
            // Random start position
            const startX = Math.random() * 400;
            const startY = Math.random() * 150;
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            // Random movement
            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 120;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            particle.style.setProperty('--end-x', endX + 'px');
            particle.style.setProperty('--end-y', endY + 'px');
            
            battleField.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }, i * 200);
    }
}

// Reset Game
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    
    bossHealth = maxBossHealth;
    units = [];
    
    // RESET COMBO SYSTEM
    for (let type in comboMeter) {
        comboMeter[type].count = 0;
        if (comboMeter[type].timer) {
            clearTimeout(comboMeter[type].timer);
        }
    }
    
    // RESET EVOLUTION SYSTEM
    for (let type in evolutionLevel) {
        evolutionLevel[type].stage = 1;
        evolutionLevel[type].count = 0;
    }
    
    // Clear battle field
    document.getElementById('battle-field').innerHTML = `
        <div id="boss-container">
            <div id="boss-image">👹</div>
            <div id="boss-name">BOSS</div>
        </div>
        <p>⚔️ BATTLE ARENA - Summon units to fight! ⚔️</p>
    `;
    
    document.getElementById('log').innerHTML = '';
    
    updateBossHealth();
    updateProgressBars();
    addLog("🔄 Game reset! Boss is back with full health!");
    addLog("♻️ All units reset to basic forms!");
}

// Add Log Entry
function addLog(message) {
    const log = document.getElementById('log');
    const logEntry = document.createElement('div');
    
    logEntry.className = 'log-entry';
    logEntry.textContent = message;
    
    // Auto-scroll to bottom
    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;
}

// Add CSS for progress bar pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes progressPulse {
        0% { opacity: 1; box-shadow: 0 0 10px rgba(78, 205, 196, 0.5); }
        50% { opacity: 0.8; box-shadow: 0 0 20px rgba(78, 205, 196, 0.8); }
        100% { opacity: 1; box-shadow: 0 0 10px rgba(78, 205, 196, 0.5); }
    }
    
    @keyframes victoryParticle {
        0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: translate(var(--end-x), var(--end-y)) scale(1.5) rotate(180deg);
            opacity: 0.9;
        }
        100% {
            transform: translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2)) scale(0) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
window.onload = initGame;
