/**
 * Unlike the other planet sector, this one is purely graphical.
 * These sectors are a bit larger than the collision hitboxes
 */

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
 * getDif - Get the difference between
 * height and the planet's lowest height
 *
 * @param  {number} height Height at point
 * @param  {Planet} planet Planet to check
 * @return {number}        Height difference
 */
function getDif(height, planet) {
    return height - planet.min_radius;
}

/**
 * A sector of a planet, used for collision detection
 * (As large bodies horribly lag the game)
 */
class PlanetSectorGraphic {
    constructor(angle, planet, stage, options) {
        // Create the body itself
        let vert = [];
        let end_angle = angle + config.planet_graphic_sector_size + config.planet_graphic_sector_inc;
        let lowest = Infinity;

        for (let i = angle; i <= end_angle; i += config.planet_graphic_sector_inc) {
            let h = planet.surface.getHeight(i);

            if (h < lowest) {
                lowest = h;
            }

            vert.push(getPos(i, h, planet.position));
        }

        /**
         * Finish off the polygon with a bit at the bottom
         * Slightly below the lowest point on the planet's surface
         */
        let h1 = planet.surface.getHeight(end_angle);
        let h2 = planet.surface.getHeight(angle);

        vert.push(getPos(end_angle, h1 - getDif(h1, planet) - 10000, planet.position));
        vert.push(getPos(angle,  h2 - getDif(h2, planet) - 10000, planet.position));

        /* Create a texture and append to stage */
        let texture = PIXI.Texture.fromImage('../assets/parts/fuel-tank.png');
        let tilingSprite = new PIXI.extras.TilingSprite(texture, 100000, 10000000);
        let pos = Matter.Vertices.centre(vert);

        tilingSprite.anchor.set(0.5, 0.5);
        tilingSprite.rotation = angle;
        tilingSprite.x = pos.x;
        tilingSprite.y = pos.y;

        stage.addChild(tilingSprite);

        let graphics = new PIXI.Graphics();
        graphics.beginFill(0);
        graphics.moveTo(vert[0].x, vert[0].y);

        for (let i=1; i<vert.length; i++) {
            graphics.lineTo(vert[i].x, vert[i].y);
        }
        graphics.lineTo(vert[0].x, vert[0].y);
        graphics.endFill();

        stage.addChild(graphics);
        tilingSprite.mask = graphics;
    }
}

module.exports = PlanetSectorGraphic;
