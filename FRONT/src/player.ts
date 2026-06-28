export interface Player extends Phaser.Physics.Arcade.Sprite {
  isShooting?: boolean;
  currentWeaponType?: string; 
  weaponSprite?: Phaser.GameObjects.Sprite;
}

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
};

export const createPlayer = (scene: Phaser.Scene): Player => {
  const player = scene.physics.add.sprite(400, 400, "walk_south") as Player;
  player.isShooting = false;
  player.currentWeaponType = undefined; 
  player.setDepth(10); // Player no layer 10
  
  createPlayerAnimations(scene, player);
  return player;
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

  // --- ANIMAÇÕES DA ARMA ---
  scene.anims.create({ key: "pistol_back", frames: scene.anims.generateFrameNumbers("pistol_back", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_right", frames: scene.anims.generateFrameNumbers("pistol_right", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_left", frames: scene.anims.generateFrameNumbers("pistol_left", { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
  scene.anims.create({ key: "pistol_south", frames: scene.anims.generateFrameNumbers("pistol_south", { start: 0, end: 8 }), frameRate: 10, repeat: -1 });
};