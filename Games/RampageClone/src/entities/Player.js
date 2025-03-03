// src/entities/Player.js
import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    
    // State variables
    this.isClimbing = false;
    this.facing = 'right';
    this.health = 100;
    
    // Create animations
    this.scene.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'climb',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'punch',
      frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
      frameRate: 10
    });
    
    // Input
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.punchKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    if (this.isClimbing) {
      this.handleClimbingMovement();
    } else {
      this.handleNormalMovement();
    }

    // Check for climbing
    const touchingBuilding = this.scene.physics.overlap(this, this.scene.buildingLayer);
    const touchingClimbable = this.scene.climbableLayer ?
      this.scene.physics.overlap(this, this.scene.climbableLayer) : touchingBuilding;
    
    if (this.cursors.up.isDown && touchingClimbable && !this.isClimbing) {
      this.isClimbing = true;
      this.body.setAllowGravity(false);
      this.play('climb', true);
    }

    // Punching
    if (Phaser.Input.Keyboard.JustDown(this.punchKey)) {
      this.punch();
    }
  }

  handleNormalMovement() {
    // Reset gravity
    this.body.setAllowGravity(true);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.setVelocityX(-160);
      this.facing = 'left';
      this.play('walk', true);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(160);
      this.facing = 'right';
      this.play('walk', true);
    } else {
      this.setVelocityX(0);
      this.stop();
    }

    // Jumping
    if (this.cursors.up.isDown && this.body.blocked.down) {
      this.setVelocityY(-330);
    }
  }

  handleClimbingMovement() {
    // Vertical movement
    if (this.cursors.up.isDown) {
      this.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(160);
    } else {
      this.setVelocityY(0);
    }

    // Horizontal movement while climbing
    if (this.cursors.left.isDown) {
      this.setVelocityX(-160);
      this.facing = 'left';
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(160);
      this.facing = 'right';
    } else {
      this.setVelocityX(0);
    }

    // Exit climbing
    if (!this.scene.physics.overlap(this, this.scene.buildingLayer) && this.cursors.down.isDown) {
      this.isClimbing = false;
      this.body.setAllowGravity(true);
      this.play('walk', true);
    }
  }

  punch() {
    this.play('punch', true);
    this.scene.sound.play('punch');

    // Check for building tiles in front
    const punchOffsetX = this.facing === 'right' ? 16 : -16;
    const punchTile = this.scene.map.getTileAtWorldXY(
      this.x + punchOffsetX,
      this.y,
      true,
      this.scene.cameras.main,
      this.scene.buildingLayer
    );

    if (punchTile && punchTile.properties.building) {
      const building = this.scene.buildings.find(b => b.obj.id === punchTile.properties.buildingId);
      if (building) {
        building.damageTile(punchTile);
      }
    }
  }

  handleNPCInteraction(player, npc) {
    if (Phaser.Input.Keyboard.JustDown(this.punchKey)) {
      npc.pickup();
      this.eatNPC(npc);
    }
  }

  eatNPC(npc) {
    npc.destroy();
    this.health += 10; // Example health boost
    this.scene.sound.play('eat');
  }
}