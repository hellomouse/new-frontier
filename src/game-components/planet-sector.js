'use strict';

const config = require('../game/config.js');


class PlanetSector {
    constructor(angle, planet) {
        // Create the body itself
        let vert = [];
        for (let i = angle; i < config.planet_sector_size; i += config.planet_sector_inc) {
            vert.push({
                x: planet.position.x + Math.cos(i) * planet.surface.getHeight(angle),
                y: planet.position.y + Math.sin(i) * planet.surface.getHeight(angle)
            });
        }
        vert.push(vert[0]);

        this.body = Matter.Bodies.fromVertices(planet.position.x, planet.position.y, vert);
        this.body.label = 'Planet-sector-' + this.angle;
        Matter.Body.setStatic(this.body, true);
    }
}

module.exports = PlanetSector;
