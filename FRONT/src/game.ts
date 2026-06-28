import * as Phaser from "phaser";
import {
  ChestSnapshot,
  GameState,
  PlayerSnapshot,
  submitPlayerInput,
} from "./api";
import {
  applyPlayerAnimation,
  ControlState,
  createControls,
  GameControls,
  readControls,
} from "./controls";
import { createPlayer, loadPlayerSprites, Player } from "./player";

const SERVER_ARENA_HALF_SIZE = 50;
const INPUT_INTERVAL_MS = 100;
const INPUT_MOVE_UNITS = 1.5;
const PLAYER_ID_STORAGE_KEY = "voxel_royale_player_id";

const idleControlState: ControlState = {
  moveX: 0,
  moveY: 0,
  openChest: false,
  isAttacking: false,
  aimX: 0,
  aimY: 0,
  direction: "",
};

const updateFrontendStatus = (message: string): void => {
  const element = document.getElementById("sync-status");
  if (element) {
    element.textContent = message;
  }
};

export default class Demo extends Phaser.Scene {
  player: Player;
  controls: GameControls;
  chestsGroup: Phaser.Physics.Arcade.StaticGroup;

  private playerId = loadOrCreatePlayerId();
  private inputSequence = 0;
  private nextInputAt = 0;
  private requestInFlight = false;
  private pendingOpenChest = false;
  private lastControlState = idleControlState;
  private chestSpritesById: { [chestId: string]: any } = {};
  private remotePlayersById: { [playerId: string]: Phaser.Physics.Arcade.Sprite } = {};
  private mapCenterX = 0;
  private mapCenterY = 0;
  private serverToWorldScale = 1;
  private statusText: Phaser.GameObjects.Text;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("mountain_img", "./assets/map5/mountain.png");
    this.load.image("wood_img", "./assets/map5/wood_tileset.png");
    this.load.image("tiles_img", "./assets/map5/tiles.png");
    this.load.image("pm_img", "./assets/map5/pm.png");
    this.load.spritesheet("bau_pixel", "./assets/map5/baus.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.tilemapTiledJSON("map", "./assets/map5/map.json");

    loadPlayerSprites(this);
  }

  create() {
    updateFrontendStatus("Cena criada. Conectando ao backend...");

    const map = this.make.tilemap({ key: "map" });
    this.configureCoordinateMapping(map);

    const tsMount = map.addTilesetImage("mountain", "mountain_img");
    const tsWood = map.addTilesetImage("wood_tileset", "wood_img");
    const tsTiles = map.addTilesetImage("tiles", "tiles_img");
    const tsPm = map.addTilesetImage("pm", "pm_img");
    const allTilesets = [tsMount, tsWood, tsTiles, tsPm];

    const layer1 = map.createLayer("Tile Layer 1", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);
    const layer2 = map.createLayer("Tile Layer 2", allTilesets as Phaser.Tilemaps.Tileset[], 0, 0);

    if (layer1) layer1.setCollisionByProperty({ collider: true });
    if (layer2) layer2.setCollisionByProperty({ collider: true });

    this.chestsGroup = this.physics.add.staticGroup();
    this.player = createPlayer(this);
    this.controls = createControls(this);
    this.statusText = this.add
      .text(12, 12, "Conectando ao backend...", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.physics.add.collider(this.player, layer1 as any);
    this.physics.add.collider(this.player, layer2 as any);
    this.physics.add.collider(this.player, this.chestsGroup, this.openChest, undefined, this);

    this.sendInput(this.lastControlState);
  }

  update(time: number) {
    if (!this.player || !this.controls) {
      return;
    }

    const controlState = readControls(this.player, this.controls, this);
    if (controlState.openChest) {
      this.pendingOpenChest = true;
    }

    this.lastControlState = controlState;
    applyPlayerAnimation(this.player, controlState);

    if (time >= this.nextInputAt && !this.requestInFlight) {
      this.nextInputAt = time + INPUT_INTERVAL_MS;
      this.sendInput(controlState);
    }
  }

  private sendInput(controlState: ControlState) {
    if (this.requestInFlight) {
      return;
    }

    const openChest = this.pendingOpenChest || controlState.openChest;
    this.pendingOpenChest = false;
    this.requestInFlight = true;

    submitPlayerInput({
      playerId: this.playerId,
      moveX: controlState.moveX * INPUT_MOVE_UNITS,
      moveY: controlState.moveY * INPUT_MOVE_UNITS,
      isAttacking: controlState.isAttacking,
      inputSequence: ++this.inputSequence,
      openChest,
      aimX: controlState.aimX,
      aimY: controlState.aimY,
    })
      .then((state) => {
        this.applyGameState(state);
      })
      .catch((error) => {
        if (openChest) {
          this.pendingOpenChest = true;
        }
        this.updateStatus(`Backend sem resposta: ${error.message || error}`);
        console.error("Erro ao sincronizar input com o backend:", error);
      })
      .then(() => {
        this.requestInFlight = false;
      });
  }

  private applyGameState(state: GameState) {
    this.renderChests(state.chests || []);
    this.renderPlayers(state.players || []);
    this.updateStatus(
      `Backend ok | tick ${state.tick || 0} | baus ${(state.chests || []).length} | jogadores ${
        (state.players || []).length
      }`
    );
  }

  private renderPlayers(players: PlayerSnapshot[]) {
    const seen: { [playerId: string]: boolean } = {};

    for (let i = 0; i < players.length; i++) {
      const snapshot = players[i];
      if (!snapshot.playerId) {
        continue;
      }

      seen[snapshot.playerId] = true;

      if (snapshot.playerId === this.playerId) {
        this.applyPlayerSnapshot(this.player, snapshot);
      } else {
        this.applyRemotePlayerSnapshot(snapshot);
      }
    }

    for (const playerId in this.remotePlayersById) {
      if (!seen[playerId]) {
        this.remotePlayersById[playerId].destroy();
        delete this.remotePlayersById[playerId];
      }
    }
  }

  private applyPlayerSnapshot(player: Player, snapshot: PlayerSnapshot) {
    const position = this.serverToWorld(snapshot.x || 0, snapshot.y || 0);
    player.setPosition(position.x, position.y);
    player.setAlpha(snapshot.isAlive === false ? 0.45 : 1);

    if (snapshot.weapon) {
      this.equipWeapon(player, snapshot.weapon);
    }

    if (player.weaponSprite) {
      player.weaponSprite.setPosition(player.x, player.y);
    }
  }

  private applyRemotePlayerSnapshot(snapshot: PlayerSnapshot) {
    const position = this.serverToWorld(snapshot.x || 0, snapshot.y || 0);
    let remotePlayer = this.remotePlayersById[snapshot.playerId];

    if (!remotePlayer) {
      remotePlayer = this.physics.add.sprite(position.x, position.y, "walk_south");
      remotePlayer.setDepth(9);
      remotePlayer.setTint(0x66aaff);
      this.remotePlayersById[snapshot.playerId] = remotePlayer;
    }

    remotePlayer.setPosition(position.x, position.y);
    remotePlayer.setAlpha(snapshot.isAlive === false ? 0.45 : 1);
  }

  private renderChests(chests: ChestSnapshot[]) {
    const seen: { [chestId: string]: boolean } = {};

    for (let i = 0; i < chests.length; i++) {
      const chest = chests[i];
      if (!chest.chestId) {
        continue;
      }

      const position = this.serverToWorld(chest.x || 0, chest.y || 0);
      let chestSprite = this.chestSpritesById[chest.chestId];

      if (!chestSprite) {
        chestSprite = this.chestsGroup.create(position.x, position.y, "bau_pixel", 0);
        chestSprite.chestId = chest.chestId;
        this.chestSpritesById[chest.chestId] = chestSprite;
      }

      chestSprite.setPosition(position.x, position.y);
      chestSprite.setFrame(chest.isOpened ? 1 : 0);
      chestSprite.refreshBody();
      seen[chest.chestId] = true;
    }

    for (const chestId in this.chestSpritesById) {
      if (!seen[chestId]) {
        this.chestSpritesById[chestId].destroy();
        delete this.chestSpritesById[chestId];
      }
    }
  }

  private configureCoordinateMapping(map: Phaser.Tilemaps.Tilemap) {
    this.mapCenterX = map.widthInPixels / 2;
    this.mapCenterY = map.heightInPixels / 2;
    this.serverToWorldScale =
      (Math.min(map.widthInPixels, map.heightInPixels) / (SERVER_ARENA_HALF_SIZE * 2)) * 0.9;
  }

  private serverToWorld(x: number, y: number) {
    return {
      x: this.mapCenterX + x * this.serverToWorldScale,
      y: this.mapCenterY + y * this.serverToWorldScale,
    };
  }

  private equipWeapon(player: Player, weaponType: string) {
    if (!player.weaponSprite) {
      player.weaponSprite = this.add.sprite(player.x, player.y, `${weaponType}_south`);
      player.weaponSprite.setDepth(11);
    } else {
      player.weaponSprite.setTexture(`${weaponType}_south`);
    }

    player.currentWeaponType = weaponType;
    player.weaponSprite.setVisible(true);
  }

  private openChest() {
    this.pendingOpenChest = true;
  }

  private updateStatus(message: string) {
    updateFrontendStatus(message);

    if (this.statusText) {
      this.statusText.setText(message);
    }
  }
}

const loadOrCreatePlayerId = (): string => {
  try {
    const existing = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated = `player-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
    window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, generated);
    return generated;
  } catch (_error) {
    return `player-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`;
  }
};

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#86b1b1",
  width: window.innerWidth,
  height: window.innerHeight,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
};

updateFrontendStatus("Inicializando Phaser...");
new Phaser.Game(config);
