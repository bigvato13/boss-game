// TCG GAME ENGINE - PHASE 1
class TCGGame {
    constructor() {
        this.gameState = {
            players: {
                streamer: { health: 30, maxHealth: 30, mana: 1, maxMana: 1 },
                viewers: { health: 30, maxHealth: 30, mana: 1, maxMana: 1 }
            },
            turn: 1,
            currentPlayer: 'viewers',
            phase: 'main'
        };
        
        this.cards = this.initializeCards();
        this.deck = this.initializeDeck();
        this.hand = [];
        this.board = {
            streamer: [],
            viewers: []
        };
        
        this.initializeGame();
    }

    // CARD DATABASE
    initializeCards() {
        return {
            // CREATURE CARDS
            'young_dragon': {
                id: 'young_dragon',
                name: 'Young Dragon',
                type: 'creature',
                cost: 3,
                attack: 2,
                health: 3,
                effect: 'Flying: Can attack over creatures',
                rarity: 'common',
                emoji: '🐲'
            },
            'fire_imp': {
                id: 'fire_imp',
                name: 'Fire Imp',
                type: 'creature',
                cost: 2,
                attack: 3,
                health: 1,
                effect: 'Quick: Can attack immediately',
                rarity: 'common',
                emoji: '👺'
            },
            'forest_guardian': {
                id: 'forest_guardian',
                name: 'Forest Guardian',
                type: 'creature',
                cost: 4,
                attack: 1,
                health: 5,
                effect: 'Taunt: Enemy must attack this first',
                rarity: 'common',
                emoji: '🌳'
            },
            
            // SPELL CARDS
            'fireball': {
                id: 'fireball',
                name: 'Fireball',
                type: 'spell',
                cost: 2,
                effect: 'Deal 3 damage to any target',
                rarity: 'common',
                emoji: '🔥'
            },
            'healing_light': {
                id: 'healing_light',
                name: 'Healing Light',
                type: 'spell',
                cost: 1,
                effect: 'Restore 4 health to a creature or player',
                rarity: 'common',
                emoji: '✨'
            },
            'lightning_bolt': {
                id: 'lightning_bolt',
                name: 'Lightning Bolt',
                type: 'spell',
                cost: 1,
                effect: 'Deal 2 damage to any target',
                rarity: 'common',
                emoji: '⚡'
            },
            
            // SUPPORT CARDS
            'mana_crystal': {
                id: 'mana_crystal',
                name: 'Mana Crystal',
                type: 'support',
                cost: 0,
                effect: 'Gain +1 max mana permanently',
                rarity: 'rare',
                emoji: '💎'
            },
            'protective_ward': {
                id: 'protective_ward',
                name: 'Protective Ward',
                type: 'support',
                cost: 1,
                effect: 'Prevent next 3 damage to your hero',
                rarity: 'uncommon',
                emoji: '🛡️'
            }
        };
    }

    // INITIALIZE DECK
    initializeDeck() {
        const deck = [];
        const cardPool = [
            'young_dragon', 'young_dragon', 'young_dragon',
            'fire_imp', 'fire_imp', 'fire_imp',
            'forest_guardian', 'forest_guardian',
            'fireball', 'fireball', 'fireball',
            'healing_light', 'healing_light',
            'lightning_bolt', 'lightning_bolt', 'lightning_bolt',
            'mana_crystal',
            'protective_ward', 'protective_ward'
        ];
        
        // Shuffle deck
        for (let i = cardPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPool[i], cardPool[j]] = [cardPool[j], cardPool[i]];
        }
        
        return cardPool;
    }

    // INITIALIZE GAME
    initializeGame() {
        this.drawInitialHand();
        this.updateGameDisplay();
        this.setupEventListeners();
    }

    // DRAW INITIAL HAND
    drawInitialHand() {
        for (let i = 0; i < 3; i++) {
            this.drawCard();
        }
    }

    // DRAW CARD
    drawCard() {
        if (this.deck.length > 0 && this.hand.length < 10) {
            const cardId = this.deck.pop();
            this.hand.push(cardId);
            this.updateHandDisplay();
            this.updateDeckCount();
            return true;
        }
        return false;
    }

    // PLAY CARD
    playCard(cardId) {
        const card = this.cards[cardId];
        const player = this.gameState.currentPlayer;
        
        if (!card) return false;
        
        // Check if player has enough mana
        if (this.gameState.players[player].mana < card.cost) {
            this.showMessage("Not enough mana!");
            return false;
        }
        
        // Deduct mana
        this.gameState.players[player].mana -= card.cost;
        
        // Remove card from hand
        const handIndex = this.hand.indexOf(cardId);
        if (handIndex > -1) {
            this.hand.splice(handIndex, 1);
        }
        
        // Handle different card types
        switch(card.type) {
            case 'creature':
                this.board[player].push({
                    ...card,
                    currentHealth: card.health,
                    canAttack: false // Summoning sickness
                });
                this.showMessage(`Summoned ${card.name}!`);
                break;
                
            case 'spell':
                this.castSpell(card);
                break;
                
            case 'support':
                this.activateSupport(card);
                break;
        }
        
        this.updateGameDisplay();
        return true;
    }

    // CAST SPELL
    castSpell(spell) {
        // For Phase 1, just show message
        this.showMessage(`Casted ${spell.name}: ${spell.effect}`);
        
        // Basic spell effects (to be expanded)
        switch(spell.id) {
            case 'fireball':
                // Will implement targeting in Phase 2
                break;
            case 'healing_light':
                // Will implement targeting in Phase 2
                break;
            case 'lightning_bolt':
                // Will implement targeting in Phase 2
                break;
        }
    }

    // ACTIVATE SUPPORT
    activateSupport(support) {
        this.showMessage(`Activated ${support.name}: ${support.effect}`);
        
        switch(support.id) {
            case 'mana_crystal':
                this.gameState.players[this.gameState.currentPlayer].maxMana++;
                this.showMessage("Max mana increased!");
                break;
            case 'protective_ward':
                // Will implement in Phase 2
                break;
        }
    }

    // END TURN
    endTurn() {
        // Switch players
        this.gameState.currentPlayer = this.gameState.currentPlayer === 'viewers' ? 'streamer' : 'viewers';
        this.gameState.turn++;
        
        // Reset mana and increase max mana
        const player = this.gameState.currentPlayer;
        this.gameState.players[player].maxMana = Math.min(this.gameState.players[player].maxMana + 1, 10);
        this.gameState.players[player].mana = this.gameState.players[player].maxMana;
        
        // Draw card for new turn
        this.drawCard();
        
        // Allow creatures to attack
        this.board[player].forEach(creature => {
            creature.canAttack = true;
        });
        
        this.updateGameDisplay();
        this.showMessage(`Turn ${this.gameState.turn} - ${this.gameState.currentPlayer.toUpperCase()}'s turn`);
    }

    // UPDATE DISPLAYS
    updateGameDisplay() {
        this.updateHealthBars();
        this.updateManaDisplay();
        this.updateTurnIndicator();
        this.updateBoardDisplays();
        this.updateHandDisplay();
        this.updateDeckCount();
    }

    updateHealthBars() {
        const streamerHealth = this.gameState.players.streamer.health;
        const viewersHealth = this.gameState.players.viewers.health;
        
        document.getElementById('opponent-health').style.width = (streamerHealth / 30 * 100) + '%';
        document.getElementById('player-health').style.width = (viewersHealth / 30 * 100) + '%';
        
        document.getElementById('opponent-health-text').textContent = `${streamerHealth}/30`;
        document.getElementById('player-health-text').textContent = `${viewersHealth}/30`;
    }

    updateManaDisplay() {
        const player = this.gameState.currentPlayer;
        const mana = this.gameState.players[player].mana;
        const maxMana = this.gameState.players[player].maxMana;
        
        document.getElementById('current-mana').textContent = mana;
        document.getElementById('max-mana').textContent = maxMana;
    }

    updateTurnIndicator() {
        document.getElementById('turn-indicator').textContent = `Turn ${this.gameState.turn} - ${this.gameState.currentPlayer.toUpperCase()}`;
    }

    updateBoardDisplays() {
        this.updateBoardDisplay('streamer', document.getElementById('opponent-board'));
        this.updateBoardDisplay('viewers', document.getElementById('player-board'));
    }

    updateBoardDisplay(player, container) {
        container.innerHTML = '';
        this.board[player].forEach((card, index) => {
            const cardElement = this.createCardElement(card, true);
            container.appendChild(cardElement);
        });
    }

    updateHandDisplay() {
        const handContainer = document.getElementById('player-hand');
        handContainer.innerHTML = '';
        
        this.hand.forEach(cardId => {
            const card = this.cards[cardId];
            const cardElement = this.createCardElement(card, false);
            handContainer.appendChild(cardElement);
        });
        
        document.getElementById('hand-count').textContent = this.hand.length;
    }

    updateDeckCount() {
        document.getElementById('deck-count').textContent = this.deck.length;
    }

    // CREATE CARD ELEMENT
    createCardElement(cardData, onBoard = false) {
        const card = document.createElement('div');
        card.className = `card ${cardData.type} ${onBoard ? 'on-board' : 'in-hand'}`;
        card.setAttribute('data-card-id', cardData.id);
        
        let cardHTML = `
            <div class="card-cost">${cardData.cost}</div>
            <div class="card-name">${cardData.name}</div>
            <div class="card-effect">${cardData.effect}</div>
        `;
        
        if (cardData.type === 'creature') {
            const health = onBoard ? cardData.currentHealth : cardData.health;
            cardHTML += `
                <div class="card-stats">
                    <div class="card-attack">${cardData.attack}⚔️</div>
                    <div class="card-health">${health}❤️</div>
                </div>
            `;
        }
        
        card.innerHTML = cardHTML;
        
        // Add event listeners
        if (!onBoard) {
            card.addEventListener('click', () => this.handleCardPlay(cardData.id));
        }
        
        card.addEventListener('mouseenter', (e) => this.showCardTooltip(e, cardData));
        card.addEventListener('mouseleave', () => this.hideCardTooltip());
        
        return card;
    }

    // CARD INTERACTIONS
    handleCardPlay(cardId) {
        if (this.gameState.currentPlayer === 'viewers') {
            this.playCard(cardId);
        } else {
            this.showMessage("Wait for your turn!");
        }
    }

    showCardTooltip(event, cardData) {
        const tooltip = document.getElementById('card-tooltip');
        tooltip.innerHTML = `
            <div id="tooltip-name">${cardData.name} ${cardData.emoji || ''}</div>
            <div id="tooltip-cost">Cost: ${cardData.cost} ⚡</div>
            <div id="tooltip-type">Type: ${cardData.type}</div>
            <div id="tooltip-effect">${cardData.effect}</div>
            ${cardData.type === 'creature' ? 
                `<div id="tooltip-stats">Attack: ${cardData.attack} ❤️ Health: ${cardData.health}</div>` : ''
            }
        `;
        
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY + 10) + 'px';
        tooltip.classList.remove('hidden');
    }

    hideCardTooltip() {
        document.getElementById('card-tooltip').classList.add('hidden');
    }

    // MESSAGE SYSTEM
    showMessage(message) {
        const status = document.getElementById('game-status');
        status.textContent = message;
        status.classList.add('pulse');
        
        setTimeout(() => {
            status.classList.remove('pulse');
        }, 2000);
    }

    // EVENT LISTENERS
    setupEventListeners() {
        document.getElementById('end-turn-btn').addEventListener('click', () => this.endTurn());
        document.getElementById('draw-card-btn').addEventListener('click', () => this.drawCard());
        
        // TikTok gift simulation (for testing)
        document.addEventListener('keypress', (e) => {
            if (e.key === '1') {
                this.simulateGift('🌹'); // Draw card
            } else if (e.key === '2') {
                this.simulateGift('🚀'); // Extra mana
            } else if (e.key === '3') {
                this.simulateGift('🦁'); // Special card
            }
        });
    }

    // TIKTOK GIFT SIMULATION (Phase 1 Testing)
    simulateGift(giftType) {
        switch(giftType) {
            case '🌹':
                this.drawCard();
                this.showMessage("🎁 Gift received: Drew a card!");
                break;
            case '🚀':
                this.gameState.players.viewers.mana += 2;
                this.showMessage("🎁 Gift received: +2 Mana!");
                this.updateManaDisplay();
                break;
            case '🦁':
                // Add a random rare card to hand
                const rareCards = Object.keys(this.cards).filter(id => this.cards[id].rarity === 'rare');
                if (rareCards.length > 0) {
                    const randomCard = rareCards[Math.floor(Math.random() * rareCards.length)];
                    this.hand.push(randomCard);
                    this.updateHandDisplay();
                    this.showMessage(`🎁 Gift received: ${this.cards[randomCard].name}!`);
                }
                break;
        }
    }
}

// INITIALIZE GAME WHEN PAGE LOADS
let tcgGame;

document.addEventListener('DOMContentLoaded', () => {
    tcgGame = new TCGGame();
    console.log('🎴 TikTok TCG Live - Phase 1 Ready!');
    
    // Add some test chat messages
    const chat = document.getElementById('live-chat-preview');
    const messages = [
        "Viewer1: Play the dragon! 🐲",
        "TCGFan: We need more mana! ⚡",
        "GamerGirl: Fireball the opponent! 🔥",
        "CardMaster: Good move! 👍",
        "StreamLover: This game is awesome! 🎮"
    ];
    
    messages.forEach((msg, index) => {
        setTimeout(() => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message';
            messageDiv.textContent = msg;
            chat.appendChild(messageDiv);
            chat.scrollTop = chat.scrollHeight;
        }, index * 3000);
    });
});
