import { Player } from "./player";
import * as Phaser from 'phaser';
export interface GameControls {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd: {
    up: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
  };
  openChest: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
}

export interface ControlState {
  moveX: number;
  moveY: number;
  openChest: boolean;
  isAttacking: boolean;
  aimX: number;
  aimY: number;
  direction: "back" | "right" | "left" | "south" | "";
}

export const createControls = (scene: Phaser.Scene): GameControls => {
  const keyboard = scene.input.keyboard;

  return {
    cursors: keyboard.createCursorKeys(),
    wasd: {
      up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    },
    openChest: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    attack: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
  };
};

export const readControls = (
  player: Player,
  controls: GameControls,
  scene: Phaser.Scene
): ControlState => {
  let moveX = 0;
  let moveY = 0;
  let direction: ControlState["direction"] = "";

  if (controls.cursors.right.isDown || controls.wasd.right.isDown) {
    moveX += 1;
    direction = "right";
  }
  if (controls.cursors.left.isDown || controls.wasd.left.isDown) {
    moveX -= 1;
    direction = "left";
  }
  if (controls.cursors.up.isDown || controls.wasd.up.isDown) {
    moveY -= 1;
    direction = "back";
  }
  if (controls.cursors.down.isDown || controls.wasd.down.isDown) {
    moveY += 1;
    direction = "south";
  }

  const length = Math.sqrt(moveX * moveX + moveY * moveY);
  if (length > 1) {
    moveX /= length;
    moveY /= length;
  }

  const pointer = scene.input.activePointer;
  const pointerWorld = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
  const aimX = pointerWorld.x - player.x;
  const aimY = pointerWorld.y - player.y;
  const aimLength = Math.sqrt(aimX * aimX + aimY * aimY);

  return {
    moveX,
    moveY,
    openChest: Phaser.Input.Keyboard.JustDown(controls.openChest),
    isAttacking: controls.attack.isDown || pointer.isDown,
    aimX: aimLength > 0 ? aimX / aimLength : 0,
    aimY: aimLength > 0 ? aimY / aimLength : 0,
    direction,
  };
};

export const applyPlayerAnimation = (player: Player, state: ControlState): void => {
  player.setVelocity(0, 0);

  const playerAnimPrefix = player.currentWeaponType ? "pose" : "walk";

  if (state.direction !== "") {
    player.setFlipX(false);
    player.anims.play(`${playerAnimPrefix}_${state.direction}`, true);
  } else {
    player.anims.stop();
    player.setFrame(0);
  }

  if (player.weaponSprite && player.currentWeaponType) {
    player.weaponSprite.x = player.x;
    player.weaponSprite.y = player.y;

    if (state.direction !== "") {
      player.weaponSprite.anims.play(`${player.currentWeaponType}_${state.direction}`, true);
    } else {
      player.weaponSprite.anims.stop();
      player.weaponSprite.setFrame(0);
    }
  }
};
