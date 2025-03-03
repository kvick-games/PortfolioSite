// src/entities/NPC.js
import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'npc');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = type; // 'civilian' or 'soldier'
    this.setCollideWorldBounds(true);

    // AI properties
    this.speed = type === 'civilian' ? 50 : 70;
    this.health = 1;
    this.attackCooldown = type === 'soldier' ? 2000 : null;
    this.lastAttack = 0;

    // Animations
    this.scene.anims.create({
      key: `${type}_walk`,
      frames: this.anims.generateFrameNumbers('npc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.play(`${type}_walk`, true);
  }

  update(time) {
    // AI behavior
    if (this.type === 'civilian') {
      // Flee from player
      const dx = this.x - this.scene.player.x;
      const dy = this.y - this.scene.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 200) {
        this.setVelocityX(dx > 0 ? this.speed : -this.speed);
      } else {
        this.setVelocityX(Phaser.Math.Between(-this.speed, this.speed));
      }
    } else if (this.type === 'soldier') {
      // Move towards player and shoot
      const dx = this.scene.player.x - this.x;
      const dy = this.scene.player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 300) {
        this.setVelocityX(dx > 0 ? this.speed : -this.speed);
        if (time > this.lastAttack + this.attackCooldown) {
          this.shoot();
          this.lastAttack = time;
        }
      }
    }
  }

  shoot() {
    // Implement shooting logic
    const bullet = this.scene.physics.add.sprite(this.x, this.y, 'bullet');
    bullet.setVelocityX(this.scene.player.x > this.x ? 200 : -200);
    this.scene.physics.add.overlap(bullet, this.scene.player, (bullet, player) => {
      player.health -= 5;
      bullet.destroy();
    });
  }

  pickup() {
    this.setVelocity(0, 0);
    // Attach to player or animate pickup
  }
}