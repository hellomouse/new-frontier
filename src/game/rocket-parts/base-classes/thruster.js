'use strict';

const RocketPart = require('../../../game-components/rocket-part.js');

/**
 * A FuelTank
 */
class Thruster extends RocketPart {
    /**
     * constructor - FuelTank
     *
     * @param  {string} image_path Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     * @param  {number} thrust     Thrust power
     * @param  {number} burn_rate  Burn rate (kg/frame)
     */
    constructor(image_path, width, height, x, y, data, id, thrust, burn_rate) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        super(image_path, width, height, x, y, data, id);
        this.thurst = thrust;
        this.burn_rate = burn_rate;

        // This class should not be constructed directly
        // To avoid confusion this will throw a new error
        if (new.target === Thruster) {
            throw new TypeError('Cannot construct Abstract instances directly - Thruster is abstract');
        }
    }

    /**
     * Update method. this.rocket is set
     * in the Rocket class
     */
    update() {
        super.update();
        this.rocket.applyForceToAll({x: 0, y: -0.005});
    }
}

module.exports = Thruster;
