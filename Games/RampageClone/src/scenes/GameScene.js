// src/scenes/GameScene.js
import Phaser from 'phaser';
import Player from '../entities/Player';
import Building from '../entities/Building';
import NPC from '../entities/NPC';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // Load tilemap and tileset
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    this.load.image('tiles', 'assets/tiles.png');
    // Load player and NPC sprites
    this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('npc', 'assets/npc.png', { frameWidth: 16, frameHeight: 16 });
    // Load sounds
    this.load.audio('punch', 'assets/sounds/punch.wav');
    this.load.audio('collapse', 'assets/sounds/collapse.wav');
    this.load.audio('eat', 'assets/sounds/eat.wav');
  }

  create() {
    // Create tilemap
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tileset', 'tiles');
    
    // Layers
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const buildingLayer = map.createLayer('Buildings', tileset, 0, 0);
    const climbableLayer = map.createLayer('Climbable', tileset, 0, 0); // Optional
    groundLayer.setCollisionByProperty({ collides: true });
    buildingLayer.setCollisionByProperty({ collides: false }); // Non-collidable for walking

    // Store references
    this.map = map;
    this.buildingLayer = buildingLayer;
    this.climbableLayer = climbableLayer;

    // Create player
    this.player = new Player(this, 100, 100);

    // Create buildings from object layer
    const buildingObjects = map.getObjectLayer('Buildings').objects;
    this.buildings = buildingObjects.map(obj => new Building(this, obj));

    // Create NPCs
    this.npcs = this.physics.add.group();
    const spawnPoints = map.getObjectLayer('SpawnPoints').objects;
    spawnPoints.forEach(point => {
      const npc = new NPC(this, point.x, point.y, point.type);
      this.npcs.add(npc);
    });

    // Set up collisions
    this.physics.add.collider(this.player, groundLayer);
    this.physics.add.overlap(this.player, this.npcs, this.player.handleNPCInteraction, null, this.player);
  }

  update() {
    this.player.update();
    this.npcs.getChildren().forEach(npc => npc.update());
    this.buildings.forEach(building => building.update());
  }
}