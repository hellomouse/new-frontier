'use strict';

const FuelTank = require('../base-classes/fuel-tank.js');
const config = require('../../config.js');

const DATA = {
    mass: 2000 * 4 + 2250 * 4, // Mass includes fuel mass
    drag: { // Assuming 3.71 m diameter
        top: 10.8,
        left: 27.5 * 4,
        right: 27.5 * 4,
        bottom: 10.8
    },
    volume: 80.21 * 4,
    density: 52.98, // Including fuel
    description: 'A fuel tank carrying liquid fuel and oxygen. Explosive.',
    category: 'Fuel'
};

/** */
class FuelTankTall extends FuelTank {
    /**
     * constructor - Construct a FuelTankSmall
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            config.imgPath + 'parts/fuel-tank/fuel-tank.png',
            config.buildGridSize,
            config.buildGridSize * 2,
            x, y, DATA, 'Tall Fuel Tank',
            8000);
    }
}

module.exports = FuelTankTall;
