'use strict';

const config = require('../game/config.js');

/**
 * getPos - Get a x y position vector given an
 * angle of a circle (math), a radius of the circle,
 * and the center of the circle
 *
 * @param  {number} angle  Angle, in radians, starting 0 = right
 * @param  {number} radius Radius of circle, in pixels
 * @param  {object} center {x: number, y : number}, position of center
 * @return {object}        {x: number, y: number}
 */
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
        let lowest = Infinity;

        for (let i = angle; i <= end_angle; i += config.planet_sector_inc) {
            let h = planet.surface.getHeight(i);

            if (h < lowest) {
                lowest = h;
            }

            vert.push(getPos(i, h, planet.position));
        }

        /**
         * Finish off the polygon with a bit at the bottom
         * Slightly below the lowest point on the planet's surface, or
         * if the surrounding points are lower, those points
         */
        lowest = Math.min(
            lowest,
            planet.surface.getHeight(angle - config.planet_sector_inc),
            planet.surface.getHeight(end_angle + config.planet_sector_inc)
        );
        vert.push(getPos(end_angle, lowest - 100, planet.position));
        vert.push(getPos(angle,  lowest - 100, planet.position));

        /* Position the body at the correct location */
        let pos = Matter.Vertices.centre(vert);
        this.body = Matter.Bodies.fromVertices(pos.x, pos.y, vert);

        /* Set proper body properties */
        let biome = config.biomes[planet.surface.getBiome(-angle)];
        this.body.friction = biome.friction;
        this.body.frictionStatic = biome.frictionStatic;
        this.body.label = 'Planet-sector-' + angle;
        Matter.Body.setStatic(this.body, true);

        // Debugging
        /* let graphics = new PIXI.Graphics();

        for (let i=1;i<vert.length;i++) {
            graphics.lineStyle(20, 0xffffff)
               .moveTo(vert[i-1].x, vert[i-1].y)
               .lineTo(vert[i].x, vert[i].y);
        }
        sim.stage.addChild(graphics); */
    }
}

module.exports = PlanetSector;
