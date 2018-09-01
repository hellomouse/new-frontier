'use strict';

const RocketPart = require('../../../game-components/rocket-part.js');

/**
 * A NoseCone
 */
class NoseCone extends RocketPart {
    /**
     * constructor - NoseCone
     *
     * @param  {string} imagePath Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     */
    constructor(imagePath, width, height, x, y, data, id) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        super(imagePath, width, height, x, y, data, id);

        // This class should not be constructed directly
        // To avoid confusion this will throw a new error
        if (new.target === NoseCone) {
            throw new TypeError('Cannot construct Abstract instances directly - NoseCone is abstract');
        }
    }
}

module.exports = NoseCone;
