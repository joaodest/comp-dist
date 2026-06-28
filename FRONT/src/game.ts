import * as Phaser from "phaser";
import { createPlayer, loadPlayerSprites } from "./player";
import { createControls, configControls } from "./controls";
//import { checkFogCollision, createFogCircle, updateFogCircle } from "./zone";
import { createFogCircle, checkFogCollision, FogCircle, updateFogCircle} from "./zone";

export default class Demo extends Phaser.Scene {
  player: any;
  controls: any;
  chestsGroup: any;
  fog: FogCircle;
  
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
    
    // Carregamento do jogador (com suas imagens divididas)
    loadPlayerSprites(this);
  }

  create() {
    // ativa a zona segura
    //this.fog = createFogCircle(this, 400, 800, 500);

    //zone update - insira os valores em 'x' e 'y' para atualizar posição, e em 'z' o diamentro
    //updateFogCircle(this.fog, this.player.x, this.player.y, z);


    // Configuração do mapa
    const map = this.make.tilemap({ key: "map" });
    
    // 1º arg: nome exato do tileset no map.json | 2º arg: key usada no preload
    const tsMount = map.addTilesetImage("mountain", "mountain_img");
    const tsWood  = map.addTilesetImage("wood_tileset", "wood_img");
    const tsTiles = map.addTilesetImage("tiles", "tiles_img");
    const tsPm    = map.addTilesetImage("pm", "pm_img");

    // Layers usam múltiplos tilesets — passa todos de uma vez
    const allTilesets = [tsMount, tsWood, tsTiles, tsPm];

    // Nomes exatos das layers do map.json
    const layer1 = map.createLayer("Tile Layer 1", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);

    // Ativa colisão nas tiles marcadas com { collider: true } no map.json
    if (layer1) layer1.setCollisionByProperty({ collider: true });
    if (layer2) layer2.setCollisionByProperty({ collider: true });

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

    // Colisão do player com ambas as layers
    this.physics.add.collider(this.player, layer1 as any);
    this.physics.add.collider(this.player, layer2 as any);
    
    // Adiciona colisão do jogador com os baús, chamando a função 'openChest'
    this.physics.add.collider(this.player, this.chestsGroup, this.openChest, undefined, this);

    // Aqui camera vai acompanhar o jogador e n sair do mapa
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Faz a câmera seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
    // Zoom (opcional)
    // this.cameras.main.setZoom(1);
  }

  update() {
    // Processamento de inputs e movimento
    configControls(this.player, this.controls, this);


    // verifica se esta na zona de perigo e emite um (log use F12 para ver)
    checkFogCollision(this.fog, this.player.x, this.player.y);

  }

  // Função auxiliar para criar os baús
  spawnChests(positions: any[]) {
    positions.forEach((pos) => {
      // Cria o baú na posição X e Y
      const chestSprite = this.chestsGroup.create(pos.x, pos.y, 'bau_pixel', 0);
      
      // salva id
      chestSprite.chestId = pos.id;
    });
  }

  // Função disparada quando o jogador colide com o baú
  openChest(player: any, chest: any) {
    // Verifica se está fechado (frame 0) para não ficar chamando o back-end sem parar
    if (chest.frame.name === 0) {
      // abrindo direto no front, sem o back ainda. comentar quando inserir logica
      chest.setFrame(1);
      console.log(`Baú ${chest.chestId} aberto (Mock)!`);
      
      // ====================================================================
      // inserir lógica aqui
      // ====================================================================
    }
  }
}

// Configuração do motor do jogo
const config = {
  type: Phaser.AUTO,
  backgroundColor: "#86b1b1",
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 }, // ← adicione x: 0
    },
  },
};

new Phaser.Game(config);