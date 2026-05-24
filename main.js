// ==================== REINO DAS CINZAS - MAIN.JS ====================
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;

// Banco de Dados
const ItemDatabase = {
    'espada_curta': { name: 'Espada Curta', type: 'weapon', damage: 5, rarity: 'comum', value: 25 },
    'espada_longa': { name: 'Espada Longa', type: 'weapon', damage: 8, rarity: 'raro', value: 80 },
    'lamina_sombria': { name: 'Lâmina Sombria', type: 'weapon', damage: 14, rarity: 'épico', value: 300 },
    'pocao_vida': { name: 'Poção de Vida', type: 'potion', heal: 2, rarity: 'comum', value: 15 },
    'pocao_vida_grande': { name: 'Poção de Vida Grande', type: 'potion', heal: 5, rarity: 'raro', value: 45 },
    'pocao_stamina': { name: 'Poção de Vigor', type: 'potion', staminaRestore: 50, rarity: 'comum', value: 12 },
    'armadura_couro': { name: 'Armadura de Couro', type: 'armor', defense: 3, rarity: 'comum', value: 40 },
    'armadura_ferro': { name: 'Armadura de Ferro', type: 'armor', defense: 6, rarity: 'raro', value: 120 },
    'amuleto_cinzas': { name: 'Amuleto das Cinzas', type: 'accessory', luck: 3, rarity: 'épico', value: 200 },
    'essencia_fogo': { name: 'Essência de Fogo', type: 'crafting', rarity: 'raro', value: 50 },
    'essencia_gelo': { name: 'Essência de Gelo', type: 'crafting', rarity: 'raro', value: 50 },
    'ferro_bruto': { name: 'Ferro Bruto', type: 'crafting', rarity: 'comum', value: 10 },
    'couro': { name: 'Couro', type: 'crafting', rarity: 'comum', value: 8 },
};

const CraftingRecipes = [
    { result: 'pocao_vida_grande', materials: ['pocao_vida', 'pocao_vida', 'essencia_fogo'], description: 'Poção de Vida Grande' },
    { result: 'armadura_ferro', materials: ['armadura_couro', 'ferro_bruto', 'ferro_bruto'], description: 'Armadura de Ferro' },
    { result: 'lamina_sombria', materials: ['espada_longa', 'essencia_fogo', 'essencia_gelo'], description: 'Lâmina Sombria' },
];

// Estado Global
const GameState = {
    playerLevel: 1, playerXP: 0, xpToNext: 100, skillPoints: 0,
    playerStats: { strength: 5, defense: 3, agility: 4, mana: 10, luck: 2 },
    playerHP: 5, playerMaxHP: 5, playerStamina: 100, playerMaxStamina: 100,
    gold: 50,
    inventory: [
        { id: 'espada_curta', quantity: 1 },
        { id: 'pocao_vida', quantity: 3 },
        { id: 'couro', quantity: 2 }
    ],
    equipment: { weapon: 'espada_curta', armor: null, accessory: null },
    reputation: { arthon: 10, korag: 0, eldryn: 0, north: 0, stormIsle: 0 },
    quests: { main: { id: 'main_01', step: 0, title: 'O Despertar das Cinzas', completed: false }, side: [] },
    completedQuests: [],
    choices: { sparedVillage: null, executedKing: false, usedForbiddenMagic: false, freedDragons: false },
    currentRegion: 'arthon', gameTime: 0, dragonsDiscovered: 0, bossesDefeated: [], ending: null,
    discoveredRecipes: ['pocao_vida_grande'], lastSaveTime: null, dragonRiding: false
};

function getEquippedWeaponDamage() {
    const wpnId = GameState.equipment.weapon;
    return wpnId && ItemDatabase[wpnId] ? ItemDatabase[wpnId].damage || 3 : 3;
}
function getEquippedArmorDefense() {
    const armId = GameState.equipment.armor;
    return armId && ItemDatabase[armId] ? ItemDatabase[armId].defense || 0 : 0;
}
function getTotalStat(statName) {
    let total = GameState.playerStats[statName] || 0;
    ['weapon', 'armor', 'accessory'].forEach(slot => {
        const id = GameState.equipment[slot];
        if (id && ItemDatabase[id] && ItemDatabase[id][statName]) total += ItemDatabase[id][statName];
    });
    return total;
}
function addToInventory(itemId, qty = 1) {
    const existing = GameState.inventory.find(i => i.id === itemId);
    if (existing) existing.quantity += qty;
    else GameState.inventory.push({ id: itemId, quantity: qty });
}
function removeFromInventory(itemId, qty = 1) {
    const existing = GameState.inventory.find(i => i.id === itemId);
    if (!existing) return false;
    existing.quantity -= qty;
    if (existing.quantity <= 0) GameState.inventory = GameState.inventory.filter(i => i.id !== itemId);
    return true;
}
function countInInventory(itemId) {
    const existing = GameState.inventory.find(i => i.id === itemId);
    return existing ? existing.quantity : 0;
}
function saveGame() {
    GameState.lastSaveTime = Date.now();
    localStorage.setItem('reino_das_cinzas_save', JSON.stringify(GameState));
    return true;
}
function loadGame() {
    const saved = localStorage.getItem('reino_das_cinzas_save');
    if (saved) { try { Object.assign(GameState, JSON.parse(saved)); return true; } catch (e) { return false; } }
    return false;
}

// ==================== BOOT SCENE ====================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // Carregar assets reais
        this.load.spritesheet('kael', 'assets/player/kael_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('tile_grass', 'assets/tiles/grass.png');
        this.load.image('tile_path', 'assets/tiles/path.png');
        this.load.image('tile_castle', 'assets/tiles/castle_floor.png');
        this.load.image('heart_full', 'assets/ui/heart_full.png');
        this.load.image('heart_empty', 'assets/ui/heart_empty.png');
        this.load.image('coin_icon', 'assets/ui/coin_icon.png');
    }
    create() {
        loadGame();
        this.cameras.main.fadeIn(500);
        this.time.delayedCall(500, () => this.scene.start('MenuScene'));
    }
}

// ==================== MENU SCENE ====================
class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a0a');
        this.add.text(width / 2, height / 2 - 80, 'REINO\nDAS\nCINZAS', {
            fontSize: '48px', color: '#c9a84c', stroke: '#000', strokeThickness: 8, align: 'center', lineSpacing: 6
        }).setOrigin(0.5);
        this.add.text(width / 2, height / 2 + 20, 'O Herdeiro das Cinzas', {
            fontSize: '18px', color: '#8b0000', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        const startBtn = this.add.text(width / 2, height / 2 + 100, '⚔️ INICIAR JORNADA', {
            fontSize: '24px', color: '#d4c48a', stroke: '#000', strokeThickness: 6, padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        startBtn.on('pointerover', () => startBtn.setColor('#ffffff'));
        startBtn.on('pointerout', () => startBtn.setColor('#d4c48a'));
        startBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(500, () => this.scene.start('GameScene'));
        });
    }
}

// ==================== GAME SCENE ====================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }
    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.cameras.main.fadeIn(500);

        // Mapa
        this.mapWidth = 2000;
        this.mapHeight = 2000;
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        // Chão com tiles (usando os assets reais)
        this.createTileMap();

        // Animações do Kael
        this.anims.create({
            key: 'walk_down',
            frames: [ { key: 'kael', frame: 0 } ],
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_left',
            frames: [ { key: 'kael', frame: 1 } ],
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_right',
            frames: [ { key: 'kael', frame: 2 } ],
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'walk_up',
            frames: [ { key: 'kael', frame: 3 } ],
            frameRate: 1,
            repeat: -1
        });

        // Jogador
        this.player = this.physics.add.sprite(400, 500, 'kael');
        this.player.setCollideWorldBounds(true).setSize(20, 28).setDepth(10);
        this.player.hp = GameState.playerHP;
        this.player.maxHp = GameState.playerMaxHP;
        this.player.attackCooldown = 0;
        this.player.alive = true;
        this.player.direction = 'down';

        // HUD
        this.hearts = [];
        for (let i = 0; i < this.player.maxHp; i++) {
            const heart = this.add.image(20 + i * 20, 20, 'heart_full').setScrollFactor(0).setDepth(100);
            this.hearts.push(heart);
        }
        this.coinIcon = this.add.image(width - 60, 20, 'coin_icon').setScrollFactor(0).setDepth(100);
        this.goldText = this.add.text(width - 40, 14, GameState.gold.toString(), {
            fontSize: '14px', color: '#ffcc00', stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(100);

        // Controles mobile
        this.joystickActive = false;
        this.mobileDirection = { x: 0, y: 0 };
        this.moveSpeed = 2.2;
        this.joystickBase = this.add.circle(80, height - 140, 40, 0x000000, 0.3).setScrollFactor(0).setDepth(200).setInteractive();
        this.joystickThumb = this.add.circle(80, height - 140, 20, 0xffffff, 0.4).setScrollFactor(0).setDepth(201);

        this.joystickBase.on('pointerdown', (pointer) => {
            this.joystickActive = true;
            this.joystickStart = { x: pointer.x, y: pointer.y };
        });
        this.input.on('pointermove', (pointer) => {
            if (!this.joystickActive) return;
            const dx = pointer.x - this.joystickStart.x;
            const dy = pointer.y - this.joystickStart.y;
            const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 35);
            const angle = Math.atan2(dy, dx);
            const tx = this.joystickStart.x + Math.cos(angle) * dist;
            const ty = this.joystickStart.y + Math.sin(angle) * dist;
            this.joystickThumb.setPosition(tx, ty);
            this.mobileDirection = { x: Math.cos(angle) * (dist / 35), y: Math.sin(angle) * (dist / 35) };
        });
        this.input.on('pointerup', () => {
            this.joystickActive = false;
            this.joystickThumb.setPosition(80, height - 140);
            this.mobileDirection = { x: 0, y: 0 };
        });

        // Botões
        const btnStyle = { fontSize: '28px', backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 10, y: 6 } };
        this.atkBtn = this.add.text(width - 70, height - 180, '⚔️', btnStyle).setOrigin(0.5).setScrollFactor(0).setDepth(200).setInteractive();
        this.atkBtn.on('pointerdown', () => this.playerAttack());

        this.interactBtn = this.add.text(width - 70, height - 110, '👆', btnStyle).setOrigin(0.5).setScrollFactor(0).setDepth(200).setInteractive();
        this.interactBtn.on('pointerdown', () => this.showFloatingText('Interagindo...', '#ffcc00'));
    }

    createTileMap() {
        const tileSize = 32;
        // Simples grid de grama com um caminho central
        for (let row = 0; row < 70; row++) {
            for (let col = 0; col < 70; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                let tile = 'tile_grass';
                // Caminho vertical no centro
                if (col > 30 && col < 38) tile = 'tile_path';
                // Castelo no topo
                if (col > 25 && col < 45 && row > 5 && row < 15) tile = 'tile_castle';
                this.add.image(x + tileSize/2, y + tileSize/2, tile).setDepth(0);
            }
        }
    }

    playerAttack() {
        if (this.player.attackCooldown > 0) return;
        this.player.attackCooldown = 20;
        this.showFloatingText('⚔️ Ataque!', '#ff4444');
    }

    showFloatingText(text, color) {
        const txt = this.add.text(this.player.x, this.player.y - 30, text, {
            fontSize: '18px', color: color, stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(300);
        this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
    }

    update() {
        if (this.joystickActive) {
            const threshold = 0.15;
            let mx = this.mobileDirection.x, my = this.mobileDirection.y;
            if (Math.abs(mx) < threshold) mx = 0;
            if (Math.abs(my) < threshold) my = 0;

            if (mx < 0) this.player.play('walk_left', true);
            else if (mx > 0) this.player.play('walk_right', true);
            else if (my < 0) this.player.play('walk_up', true);
            else if (my > 0) this.player.play('walk_down', true);

            this.player.x += mx * this.moveSpeed;
            this.player.y += my * this.moveSpeed;
        }

        if (this.player.attackCooldown > 0) this.player.attackCooldown--;

        this.hearts.forEach((heart, i) => {
            heart.setTexture(i < this.player.hp ? 'heart_full' : 'heart_empty');
        });
        this.goldText.setText(GameState.gold.toString());
    }
}

// ==================== CONFIGURAÇÃO FINAL ====================
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: GAME_WIDTH, height: GAME_HEIGHT },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, GameScene],
    backgroundColor: '#0a0a0a'
};
const game = new Phaser.Game(config);