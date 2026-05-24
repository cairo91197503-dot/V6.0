// ==================== REINO DAS CINZAS - COM ASSETS EXTERNOS ====================
const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;

// Banco de Dados (igual)
const ItemDatabase = { /* ... */ };
const CraftingRecipes = [ /* ... */ ];
const GameState = { /* ... */ };
// funções auxiliares...

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        // Carregar assets da pasta /assets/
        this.load.spritesheet('kael', 'assets/player/kael_spritesheet.png', { frameWidth: 32, frameHeight: 32 });
        this.load.image('enemy_darkknight', 'assets/enemies/dark_knight.png');
        this.load.image('tile_grass', 'assets/tiles/grass.png');
        this.load.image('tile_path', 'assets/tiles/path.png');
        this.load.image('tile_castle', 'assets/tiles/castle.png');
        this.load.image('heart_full', 'assets/ui/heart_full.png');
        this.load.image('heart_empty', 'assets/ui/heart_empty.png');
        this.load.image('particle', 'assets/particle.png');
        // ... outros assets
    }
    create() {
        loadGame();
        this.cameras.main.fadeIn(500);
        this.time.delayedCall(500, () => this.scene.start('MenuScene'));
    }
}

// MenuScene (mesma, mas pode usar assets)
// GameScene (usar this.add.tileSprite para o chão, this.add.sprite com as texturas carregadas)

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: GAME_WIDTH, height: GAME_HEIGHT },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, MenuScene, GameScene, InventoryScene, QuestLogScene],
    backgroundColor: '#0a0a0a'
};
const game = new Phaser.Game(config);
