'use strict';

const config = require('../game/config.js');

function getPos(angle, radius, center) {
    return {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
    };
}

/**
 * A sector of a planet, used for collision detection
 * (As large bodies horribly lag the game)
 */
class PlanetSector {
    constructor(angle, planet) {
        // Create the body itself
        let vert = [];
        let end_angle = angle + config.planet_sector_size + config.planet_sector_inc;

        for (let i = angle; i <= end_angle; i += config.planet_sector_inc) {
            vert.push(getPos(i, planet.surface.getHeight(i), planet.position));
        }

        vert.push(getPos(end_angle, planet.surface.getHeight(end_angle) * 0.99, planet.position));
        vert.push(getPos(angle, planet.surface.getHeight(angle) * 0.99, planet.position));

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
