'use strict';

const RocketPart = require('../../../game-components/rocket-part.js');

/**
 * A FuelTank
 */
class FuelTank extends RocketPart {
    /**
     * constructor - FuelTank
     *
     * @param  {string} imagePath Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     * @param  {number} fuel       Fuel capacity, in kg of fuel
     */
    constructor(imagePath, width, height, x, y, data, id, fuel) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        super(imagePath, width, height, x, y, data, id);
        this.fuel = fuel;

        // This class should not be constructed directly
        // To avoid confusion this will throw a new error
        if (new.target === FuelTank) {
            throw new TypeError('Cannot construct Abstract instances directly - FuelTank is abstract');
        }
    }

    /**
     * subtractFuel - Remove some fuel from
     * the fuel tank. Recalculates mass and other
     * instance variables.
     *
     * @param  {number} mass Mass of fuel to remove
     */
    subtractFuel(mass) {
        let toSubtract = this.fuel - mass < 0 ? this.fuel : mass;

        this.fuel -= toSubtract;
        this.data.mass -= toSubtract;
        this.data.density = this.data.mass / this.data.volume;
    }
}

module.exports = FuelTank;
