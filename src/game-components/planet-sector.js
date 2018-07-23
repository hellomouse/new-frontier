'use strict';

const config = require('../game/config.js');

/**
 * A sector of a planet, used for collision detection
 * (As large bodies horribly lag the game)
 */
class PlanetSector {
    constructor(angle, planet) {
        // Create the body itself
        let vert = [];
        for (let i = angle; i <= angle + config.planet_sector_size + config.planet_sector_inc; i += config.planet_sector_inc) {
            vert.push({
                x: planet.position.x + Math.cos(i) * planet.surface.getHeight(angle),
                y: planet.position.y + Math.sin(i) * planet.surface.getHeight(angle)
            });
        }

        let pos = Matter.Vertices.centre(vert);

        this.body = Matter.Bodies.fromVertices(pos.x, pos.y, vert);
        this.body.label = 'Planet-sector-' + angle;
        Matter.Body.setStatic(this.body, true);

        // Debugging
        let graphics = new PIXI.Graphics();

        for (let i=1;i<vert.length;i++) {
            graphics.lineStyle(20, 0xffffff)
               .moveTo(vert[i-1].x, vert[i-1].y)
               .lineTo(vert[i].x, vert[i].y);
        }
        sim.stage.addChild(graphics);
    }
}

module.exports = PlanetSector;
