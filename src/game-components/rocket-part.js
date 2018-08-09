'use strict';

const PhysicalSprite = require('../components/physical-sprite.js');

/**
 * A RocketPart
 */
class RocketPart extends PhysicalSprite {
    /**
     * constructor - RocketPart
     *
     * @param  {string} image_path Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     */
    constructor(image_path, width, height, x, y, data) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        let body = Matter.Bodies.rectangle(x, y, width, height);
        super(image_path, width, height, body);

        this.image_path = image_path;
        this.skip_add_body = true;

        /* Data that should be overrided by another
         * class that extends this class */
        this.id = null;

        /* Data provided */
        this.x = x;
        this.y = y;

        /* Data should be provided in this format
         * {
         *     mass: <number>,    Mass in kg
         *     area: {            Area in m^3 for each 'face'
         *        top: <number>,
         *        left: <number>,
         *        right: <number>,
         *        bottom: <number>
         *     },
         *     volume: <number>,  Volume in m^3
         *     density: <number>, Density in kg/m^3
         *     description: <string>,
         *     category: <string>
         * }
         */
        this.data = data;
    }
}

module.exports = RocketPart;
