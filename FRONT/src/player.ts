export interface Player extends Phaser.Physics.Arcade.Sprite {
  isShooting?: boolean;
}

// Substitua pelos valores exatos se o tamanho do frame for diferente
const FRAME_WIDTH = 64;  
const FRAME_HEIGHT = 60; 

export const loadPlayerSprites = (scene: Phaser.Scene): void => {
  const config = { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT };

  // Carregando os sprites separados para cada direção
  scene.load.spritesheet("walk_right", "./assets/player/AgentWalkD.png", config);
  scene.load.spritesheet("walk_left", "./assets/player/AgentWalkE.png", config);
  scene.load.spritesheet("walk_south", "./assets/player/AgentWalkF.png", config);
  scene.load.spritesheet("walk_back", "./assets/player/AgentWalkC.png", config);
  scene.load.spritesheet("shoot", "./assets/player/AgentShoot.png", config);
};

export const createPlayer = (scene: Phaser.Scene): Player => {
  const player = scene.physics.add.sprite(400, 400, "walk_south") as Player;
  player.isShooting = false;
  createPlayerAnimations(scene, player);
  return player;
};

export const createPlayerAnimations = (scene: Phaser.Scene, player: Player): void => {
  
  // Atualizado para 9 frames (start: 0, end: 8) conforme a imagem enviada
  scene.anims.create({
    key: "walk_right",
    frames: scene.anims.generateFrameNumbers("walk_right", { start: 0, end: 7 }), 
    frameRate: 10,
    repeat: -1,
  });

  // Assumindo que a imagem da esquerda também tenha 9 frames
  scene.anims.create({
    key: "walk_left",
    frames: scene.anims.generateFrameNumbers("walk_left", { start: 0, end: 7 }), 
    frameRate: 10,
    repeat: -1,
  });
  scene.anims.create({
    key: "walk_south",
    frames: scene.anims.generateFrameNumbers("walk_south", { start: 0, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk_back",
    frames: scene.anims.generateFrameNumbers("walk_back", { start: 0, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });
};