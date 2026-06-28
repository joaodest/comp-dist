import { Player } from "./player";

export const createControls = (scene: Phaser.Scene) => {
  return scene.input.keyboard.createCursorKeys();
};

export const configControls = (player: Player, controls: any, scene: Phaser.Scene): void => {
  player.setVelocity(0, 0);
  const speed = 200;

  // Se tiver arma, usa a "pose", senão usa o "walk" normal
  const playerAnimPrefix = player.currentWeaponType ? "pose" : "walk";
  let currentDirection = ""; 

  if (controls.right.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_right`, true);
    player.setVelocityX(speed);
    currentDirection = "right";
  } else if (controls.left.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_left`, true);
    player.setVelocityX(-speed);
    currentDirection = "left";
  } else if (controls.up.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_back`, true); 
    player.setVelocityY(-speed);
    currentDirection = "back";
  } else if (controls.down.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_south`, true);
    player.setVelocityY(speed);
    currentDirection = "south";
  } else {
    player.anims.stop();
    player.setFrame(0); 
  }

  // =========================================================
  // SINCRONIZAÇÃO DO SPRITE DA ARMA COM O JOGADOR
  // =========================================================
  if (player.weaponSprite && player.currentWeaponType) {
    // A arma gruda no jogador
    player.weaponSprite.x = player.x;
    player.weaponSprite.y = player.y;

    if (currentDirection !== "") {
      // Toca a animação da arma (ex: "pistol_right")
      player.weaponSprite.anims.play(`${player.currentWeaponType}_${currentDirection}`, true);
    } else {
      // Para a animação da arma quando o player parar
      player.weaponSprite.anims.stop();
      player.weaponSprite.setFrame(0);
    }
  }
};