// src/entities/Building.js
export default class Building {
    constructor(scene, obj) {
      this.scene = scene;
      this.obj = obj;
      this.tiles = scene.map.getTilesWithinWorldXY(
        obj.x,
        obj.y,
        obj.width,
        obj.height,
        { isNotEmpty: true },
        scene.buildingLayer
      );
      
      // Assign building ID to tiles
      this.tiles.forEach(tile => {
        tile.properties.buildingId = obj.id;
        tile.properties.health = 1; // Each tile has health
      });
  
      this.intactTiles = this.tiles.length;
      this.threshold = obj.properties.collapseThreshold || 0.5;
    }
  
    damageTile(tile) {
      tile.properties.health -= 1;
      if (tile.properties.health <= 0) {
        this.scene.map.removeTileAt(tile.x, tile.y, true, true, this.scene.buildingLayer);
        this.intactTiles -= 1;
  
        if (this.intactTiles / this.tiles.length < this.threshold) {
          this.collapse();
        }
      }
    }
  
    collapse() {
      // Vibrate animation
      this.scene.tweens.add({
        targets: { x: this.obj.x, y: this.obj.y },
        x: this.obj.x + Phaser.Math.Between(-5, 5),
        y: this.obj.y + Phaser.Math.Between(-5, 5),
        duration: 100,
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          // Collapse downward
          this.scene.tweens.add({
            targets: { y: this.obj.y },
            y: this.obj.y + 100,
            duration: 500,
            onComplete: () => {
              // Remove all tiles
              this.tiles.forEach(tile => {
                this.scene.map.removeTileAt(tile.x, tile.y, true, true, this.scene.buildingLayer);
              });
              
              // Spawn explosion particles
              const particles = this.scene.add.particles('explosion');
              particles.createEmitter({
                x: this.obj.x + this.obj.width / 2,
                y: this.obj.y + this.obj.height / 2,
                speed: { min: -800, max: 800 },
                angle: { min: 0, max: 360 },
                scale: { start: 1, end: 0 },
                lifespan: 600,
                blendMode: 'ADD'
              });
  
              // Play collapse sound
              this.scene.sound.play('collapse');
  
              // Check if player is climbing
              if (this.scene.player.isClimbing) {
                this.scene.player.isClimbing = false;
                this.scene.player.body.setAllowGravity(true);
              }
            }
          });
        }
      });
    }
  
    update() {
      // Optional updates, e.g., particle effects
    }
  }