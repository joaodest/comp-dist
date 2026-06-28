import * as Phaser from "phaser";
import { Player } from "./player";

export interface Controls {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  fireKey: Phaser.Input.Keyboard.Key;
}

export const createControls = (scene: Phaser.Scene): Controls => {
  return {
    cursors: scene.input.keyboard!.createCursorKeys(),
    fireKey: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
  };
};

// Mapa de direção (facing) -> angulo em radianos
const FACING_TO_ANGLE: Record<string, number> = {
  right: 0,
  south: Math.PI / 2,
  left: Math.PI,
  back: -Math.PI / 2,
};

// Cena que expõe o sistema de tiro definido em game.ts.
export type GameScene = Phaser.Scene & {
  fireWeapon(player: Player, angle: number): void;
};

export const configControls = (player: Player, controls: Controls, scene: GameScene): void => {
  player.setVelocity(0, 0);
  const speed = 200;

  // Se tiver arma, usa a "pose", senão usa o "walk" normal
  const playerAnimPrefix = player.currentWeaponType ? "pose" : "walk";
  let currentDirection = "";
  const cursors = controls.cursors;

  if (cursors.right.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_right`, true);
    player.setVelocityX(speed);
    currentDirection = "right";
  } else if (cursors.left.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_left`, true);
    player.setVelocityX(-speed);
    currentDirection = "left";
  } else if (cursors.up.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_back`, true);
    player.setVelocityY(-speed);
    currentDirection = "back";
  } else if (cursors.down.isDown) {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_south`, true);
    player.setVelocityY(speed);
    currentDirection = "south";
  } else {
    player.anims.stop();
    player.setFrame(0);
  }

  // Mantem o facing do jogador (usado para apontar o tiro quando parado)
  if (currentDirection !== "") {
    player.facing = currentDirection as Player["facing"];
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

  // =========================================================
  // INPUT DE TIRO (SPACE ou click do mouse)
  // =========================================================
  if (!player.currentWeaponType) return;

  const wantsFire = controls.fireKey.isDown || scene.input.activePointer.isDown;
  if (!wantsFire) return;

  // Mira sempre na direção que o personagem está virado
  const angle = FACING_TO_ANGLE[player.facing || "south"];
  scene.fireWeapon(player, angle);
};