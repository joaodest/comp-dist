export interface Player extends Phaser.Physics.Arcade.Sprite {
  isShooting?: boolean;
  currentWeaponType?: string;
  weaponSprite?: Phaser.GameObjects.Sprite;
  lastFiredAt?: number;
  facing?: "back" | "south" | "left" | "right";
}

export interface WeaponStats {
  damage: number;
  speed: number;
  cooldownMs: number;
  pellets: number;
  spreadRad: number;
  bulletTexture: string;
  lifespanMs: number;
}

export const WEAPON_STATS: Record<string, WeaponStats> = {
  pistol: {
    damage: 25,
    speed: 700,
    cooldownMs: 300,
    pellets: 1,
    spreadRad: 0,
    bulletTexture: "pistol_bullet",
    lifespanMs: 1200,
  },
  rifle: {
    damage: 15,
    speed: 900,
    cooldownMs: 110,
    pellets: 1,
    spreadRad: 0.04,
    bulletTexture: "rifle_bullet",
    lifespanMs: 1500,
  },
  shotgun: {
    damage: 12,
    speed: 600,
    cooldownMs: 700,
    pellets: 5,
    spreadRad: 0.35,
    bulletTexture: "pistol_bullet",
    lifespanMs: 600,
  },
};

const FRAME_WIDTH = 64;  
const FRAME_HEIGHT = 60; 

export const loadPlayerSprites = (scene: Phaser.Scene): void => {
  const config = { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT };

  // 1. Jogador Desarmado (Walk Normal)
  scene.load.spritesheet("walk_back", "./assets/player/AgentWalkC.png", config);
  scene.load.spritesheet("walk_right", "./assets/player/AgentWalkD.png", config);
  scene.load.spritesheet("walk_left", "./assets/player/AgentWalkE.png", config);
  scene.load.spritesheet("walk_south", "./assets/player/AgentWalkF.png", config);

  // 2. Jogador na Pose de Segurar Arma (Shoot Pose)
  scene.load.spritesheet("pose_back", "./assets/player/AgentShootC.png", config);
  scene.load.spritesheet("pose_right", "./assets/player/AgentShootD.png", config);
  scene.load.spritesheet("pose_left", "./assets/player/AgentShootE.png", config);
  scene.load.spritesheet("pose_south", "./assets/player/AgentShootF.png", config);

  // 3. Sprites da Arma (Pistola)
  scene.load.spritesheet("pistol_back", "./assets/guns/PistolsC.png", config);
  scene.load.spritesheet("pistol_right", "./assets/guns/PistolsD.png", config);
  scene.load.spritesheet("pistol_left", "./assets/guns/PistolsE.png", config);
  scene.load.spritesheet("pistol_south", "./assets/guns/PistolsF.png", config);

  // 4. Sprites da Arma (Rifle)
  scene.load.spritesheet("rifle_back", "./assets/guns/AssaultRifleC.png", config);
  scene.load.spritesheet("rifle_right", "./assets/guns/AssaultRifleD.png", config);
  scene.load.spritesheet("rifle_left", "./assets/guns/AssaultRifleE.png", config);
  scene.load.spritesheet("rifle_south", "./assets/guns/AssaultRifleF.png", config);
  
  // 5. Sprites da Arma (Shotgun)
  scene.load.spritesheet("shotgun_back", "./assets/guns/ShotgunC.png", config);
  scene.load.spritesheet("shotgun_right", "./assets/guns/ShotgunD.png", config);
  scene.load.spritesheet("shotgun_left", "./assets/guns/ShotgunE.png", config);
  scene.load.spritesheet("shotgun_south", "./assets/guns/ShotgunF.png", config);
};

export const createPlayer = (scene: Phaser.Scene): Player => {
  const player = scene.physics.add.sprite(400, 400, "walk_south") as Player;
  player.isShooting = false;
  player.currentWeaponType = undefined;
  player.lastFiredAt = 0;
  player.facing = "south";
  player.setDepth(10); // Player no layer 10

  createPlayerAnimations(scene, player);
  return player;
};

export const loadBulletSprites = (scene: Phaser.Scene): void => {
  // Carrega as balas como imagens simples (rotacionadas por codigo)
  scene.load.image("pistol_bullet", "./assets/guns/pistol_bullet_sprite.png");
  scene.load.image("rifle_bullet", "./assets/guns/rifle_cartridge_sprite.png");
};

export const createPlayerAnimations = (scene: Phaser.Scene, player: Player): void => {
  // --- ANIMAÇÕES DESARMADO ---
  scene.anims.create({ key: "walk_back", frames: scene.anims.generateFrameNumbers("walk_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "walk_right", frames: scene.anims.generateFrameNumbers("walk_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "walk_left", frames: scene.anims.generateFrameNumbers("walk_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "walk_south", frames: scene.anims.generateFrameNumbers("walk_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });

  // --- ANIMAÇÕES DA POSE ARMADA ---
  scene.anims.create({ key: "pose_back", frames: scene.anims.generateFrameNumbers("pose_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pose_right", frames: scene.anims.generateFrameNumbers("pose_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pose_left", frames: scene.anims.generateFrameNumbers("pose_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pose_south", frames: scene.anims.generateFrameNumbers("pose_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });

  // --- ANIMAÇÕES DA Pistola ---
  scene.anims.create({ key: "pistol_back", frames: scene.anims.generateFrameNumbers("pistol_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_right", frames: scene.anims.generateFrameNumbers("pistol_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_left", frames: scene.anims.generateFrameNumbers("pistol_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_south", frames: scene.anims.generateFrameNumbers("pistol_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });

  // --- ANIMAÇÕES DO RIFLE ---
  scene.anims.create({ key: "rifle_back", frames: scene.anims.generateFrameNumbers("rifle_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "rifle_right", frames: scene.anims.generateFrameNumbers("rifle_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "rifle_left", frames: scene.anims.generateFrameNumbers("rifle_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "rifle_south", frames: scene.anims.generateFrameNumbers("rifle_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });

  // --- ANIMAÇÕES DO SHOTGUN ---
  scene.anims.create({ key: "shotgun_back", frames: scene.anims.generateFrameNumbers("shotgun_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "shotgun_right", frames: scene.anims.generateFrameNumbers("shotgun_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "shotgun_left", frames: scene.anims.generateFrameNumbers("shotgun_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "shotgun_south", frames: scene.anims.generateFrameNumbers("shotgun_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });

}