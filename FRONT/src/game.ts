import * as Phaser from "phaser";
import { createPlayer, loadPlayerSprites, loadBulletSprites, WEAPON_STATS, Player } from "./player";
import { createControls, configControls } from "./controls";

export default class Demo extends Phaser.Scene {
  player: any;
  controls: any;
  chestsGroup: any;
  projectilesGroup: any;
  mapLayers: any[] = [];
  weaponHudIcon: Phaser.GameObjects.Image | null = null;
  weaponHudLabel: Phaser.GameObjects.Text | null = null;
  // Variável para guardar o grupo de baús

  constructor() {
    super("demo");
  }

  preload() {
    // Cada key deve ser única e diferente do nome do tileset no JSON
    this.load.image("mountain_img", "./assets/map5/mountain.png");
    this.load.image("wood_img", "./assets/map5/wood_tileset.png");
    this.load.image("tiles_img", "./assets/map5/tiles.png");
    this.load.image("pm_img", "./assets/map5/pm.png");
    this.load.spritesheet('bau_pixel', './assets/map5/baus.png', { 
        frameWidth: 32,  // Largura de UM baú
        frameHeight: 32  // Altura do baú
    });
    this.load.tilemapTiledJSON("map", "./assets/map5/map.json");
    
    // Carregamento do jogador (com suas imagens divididas e armas)
    loadPlayerSprites(this);
    // Carregamento das texturas de projétil (pistol, rifle, shotgun reusa pistol)
    loadBulletSprites(this);
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    
    // 1º arg: nome exato do tileset no map.json | 2º arg: key usada no preload
    const tsMount = map.addTilesetImage("mountain", "mountain_img");
    const tsWood = map.addTilesetImage("wood_tileset", "wood_img");
    const tsTiles = map.addTilesetImage("tiles", "tiles_img");
    const tsPm = map.addTilesetImage("pm", "pm_img");

    // Layers usam múltiplos tilesets — passa todos de uma vez
    const allTilesets = [tsMount, tsWood, tsTiles, tsPm];
    
    // Nomes exatos das layers do map.json
    const layer1 = map.createLayer("Tile Layer 1", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);

    // Ativa colisão nas tiles marcadas com { collider: true } no map.json
    if (layer1) layer1.setCollisionByProperty({ collider: true });
    if (layer2) layer2.setCollisionByProperty({ collider: true });
    this.mapLayers = [layer1, layer2].filter(Boolean);

    // Grupo de projéteis (balas disparadas pelos jogadores)
    this.projectilesGroup = this.physics.add.group({
      runChildUpdate: false,
    });
    
    // cria um grupo estático para os baús
    this.chestsGroup = this.physics.add.staticGroup();
    
    // id falso simulando oq o back vai mandar
    const mockChestPositions = [
      { id: "chest_01", x: 150, y: 200 },
      { id: "chest_02", x: 300, y: 350 },
      { id: "chest_03", x: 500, y: 150 },
      { id: "chest_04", x: 700, y: 400 },
      { id: "chest_05", x: 900, y: 250 },
      { id: "chest_06", x: 1200, y: 600 },
      { id: "chest_07", x: 1450, y: 300 },
      { id: "chest_08", x: 800, y: 950 },
      { id: "chest_09", x: 1750, y: 1200 },
      { id: "chest_10", x: 400, y: 1400 },
      { id: "chest_11", x: 1500, y: 600 },
      { id: "chest_12", x: 2000, y: 800 },
      { id: "chest_13", x: 2500, y: 1000 },
      { id: "chest_14", x: 100, y: 1200 },
      { id: "chest_15", x: 600, y: 1500 }
    ];
    
    // 2. FUTURO Back-end: buscar posições reais do servidor via Gateway
    /*
    fetch('http://gateway:PORTA/api/v1/game/chests')
      .then(response => response.json())
      .then(data => {
         this.spawnChests(data.chests);
      })
      .catch(err => console.error('Erro ao buscar baús do servidor:', err));
    */

    // desenha baus na tela
    this.spawnChests(mockChestPositions);
    // ------------------------------------------------

    this.player = createPlayer(this);
    this.controls = createControls(this);

    // Aqui camera vai acompanhar o jogador e n sair do mapa
    this.cameras.main.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels
    );
    
    // Faz a câmera seguir o jogador
    this.cameras.main.startFollow(
      this.player,
      true,
      0.08,
      0.08
    );
    
    // Zoom (opcional)
    // this.cameras.main.setZoom(1);

    // Colisão do player com ambas as layers
    this.physics.add.collider(this.player, layer1 as any);
    this.physics.add.collider(this.player, layer2 as any);

    // Adiciona colisão do jogador com os baús, chamando a função 'openChest'
    this.physics.add.collider(this.player, this.chestsGroup, this.openChest, undefined, this);

    // HUD: ícone da arma equipada no canto superior esquerdo (fixo na câmera)
    this.weaponHudIcon = this.add
      .image(40, 40, "pistol_south", 0)
      .setScrollFactor(0)
      .setDepth(1000)
      .setScale(1.2)
      .setVisible(false);
    this.weaponHudLabel = this.add
      .text(75, 28, "", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // Projéteis colidem com as layers do mapa e são destruídos
    this.mapLayers.forEach((layer) => {
      this.physics.add.collider(this.projectilesGroup, layer, (bullet: any) => {
        bullet.destroy();
      });
    });
  }

  update() {
    // Processamento de inputs, movimento e sincronização da arma
    configControls(this.player, this.controls, this);

    // Limpa projéteis que sairam dos limites do mapa (evita vazamento)
    const cam = this.cameras.main;
    const bounds = cam.getBounds();
    this.projectilesGroup.getChildren().forEach((b: any) => {
      if (
        b.x < bounds.x - 50 ||
        b.x > bounds.x + bounds.width + 50 ||
        b.y < bounds.y - 50 ||
        b.y > bounds.y + bounds.height + 50
      ) {
        b.destroy();
      }
    });
  }

  // ====================================================================
  // Sistema de projéteis
  // ====================================================================
  fireWeapon(player: Player, angle: number) {
    if (!player.currentWeaponType) return;
    const stats = WEAPON_STATS[player.currentWeaponType];
    if (!stats) return;

    const now = this.time.now;
    if (player.lastFiredAt && now - player.lastFiredAt < stats.cooldownMs) return;
    player.lastFiredAt = now;

    // Spawn de cada projétil (shotgun dispara varios em leque)
    for (let i = 0; i < stats.pellets; i++) {
      // Distribui o spread em torno do angulo principal
      const offset =
        stats.pellets === 1
          ? (Math.random() - 0.5) * stats.spreadRad
          : ((i - (stats.pellets - 1) / 2) / Math.max(stats.pellets - 1, 1)) * stats.spreadRad;
      const theta = angle + offset;

      // Spawn ligeiramente à frente do player pra não colidir com ele
      const spawnDist = 24;
      const x = player.x + Math.cos(theta) * spawnDist;
      const y = player.y + Math.sin(theta) * spawnDist;

      const bullet = this.projectilesGroup.create(x, y, stats.bulletTexture);
      bullet.setDepth(9); // abaixo do player (10)
      bullet.setRotation(theta);
      bullet.setScale(0.01); // sprites de bala são gigantes (2720x800)
      // Hitbox menor que a textura, centralizada no sprite
      const hitboxSize = 40;
      const offsetX = (bullet.width - hitboxSize) / 2;
      const offsetY = (bullet.height - hitboxSize) / 2;
      bullet.body.setSize(hitboxSize, hitboxSize);
      bullet.body.setOffset(offsetX, offsetY);
      bullet.setVelocity(Math.cos(theta) * stats.speed, Math.sin(theta) * stats.speed);
      bullet.damage = stats.damage;
      bullet.ownerId = (player as any).playerId || "local";
      bullet.weaponType = player.currentWeaponType;

      // Auto-destroy por lifespan (caso não bata em nada)
      this.time.delayedCall(stats.lifespanMs, () => {
        if (bullet && bullet.active) bullet.destroy();
      });
    }
  }

  // Função auxiliar para criar os baús
  spawnChests(positions: any[]) {
    positions.forEach((pos) => {
      // Cria o baú na posição X e Y
      let chestSprite = this.chestsGroup.create(pos.x, pos.y, 'bau_pixel', 0);
      
      // salva id
      chestSprite.chestId = pos.id;
    });
  }

// ====================================================================
  // Função para equipar a arma no jogador
  // ====================================================================
  equipWeapon(player: any, weaponType: string) {
    // Se o player ainda não tiver o sprite da arma, cria um colado nele
    if (!player.weaponSprite) {
      player.weaponSprite = this.add.sprite(player.x, player.y, `${weaponType}_south`);
      // Coloca no layer 11 (acima do player que está no 10)
      player.weaponSprite.setDepth(11); 
    }
    
    player.currentWeaponType = weaponType;
    player.weaponSprite.setVisible(true);
    console.log(`Jogador equipou a arma: ${weaponType}`);

    // Atualiza o HUD da arma
    if (this.weaponHudIcon && this.weaponHudLabel) {
      this.weaponHudIcon.setTexture(`${weaponType}_south`, 0);
      this.weaponHudIcon.setVisible(true);
      this.weaponHudLabel.setText(weaponType.toUpperCase());
    }
  }

  // Função disparada quando o jogador colide com o baú
  openChest(player: any, chest: any) {
    if (chest.frame.name === 0) {
      chest.setFrame(1);
      console.log(`Baú ${chest.chestId} aberto (Mock)!`);

      // Simulando retorno do Back: sorteia uma arma aleatoria entre as 3
      const weapons = ["pistol", "rifle", "shotgun"];
      const mockBackendResponse = {
        weaponType: weapons[Math.floor(Math.random() * weapons.length)],
      };
      console.log(`Arma sorteada: ${mockBackendResponse.weaponType}`);

      this.equipWeapon(player, mockBackendResponse.weaponType);
    }
  }
}
const config = {
  type: Phaser.AUTO,
  backgroundColor: "#86b1b1",
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

new Phaser.Game(config);