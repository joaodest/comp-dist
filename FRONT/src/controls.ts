import { Player } from "./player";

export const createControls = (scene: Phaser.Scene) => {
  return scene.input.keyboard.createCursorKeys();
};

export const configControls = (player: Player, controls: any, scene: Phaser.Scene): void => {
  player.setVelocity(0, 0);

  

  const speed = 200;

  if (controls.right.isDown) {
    player.setFlipX(false);
    player.anims.play("walk_right", true);
    player.setVelocityX(speed);
  } else if (controls.left.isDown) {
    player.setFlipX(false);
    player.anims.play("walk_left", true);
    player.setVelocityX(-speed);
  } else if (controls.up.isDown) {
    player.setFlipX(false);
    player.anims.play("walk_back", true); 
    player.setVelocityY(-speed);
  } else if (controls.down.isDown) {
    player.setFlipX(false);
    player.anims.play("walk_south", true);
    player.setVelocityY(speed);
  } else if (controls.space.isDown) {
    player.isShooting = true;
    player.anims.play("shoot", true);
    player.once("animationcomplete", () => { player.isShooting = false; });
  } else {
    player.anims.stop();
    player.setFrame(0); 
  }
};