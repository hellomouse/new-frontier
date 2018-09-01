'use strict';

const fuelTank = require('../base-classes/fuel-tank.js');
const config = require('../../config.js');

const DATA = {
    mass: 2000 * 2 + 2250 * 2, // Mass includes fuel mass
    drag: { // Assuming 3.71 m diameter``
        top: 10.8,
        left: 27.5 * 2,
        right: 27.5 * 2,
        bottom: 10.8
    },
    volume: 80.21 * 2,
    density: 52.98, // Including fuel
    description: 'A fuel tank carrying liquid fuel and oxygen. Explosive.',
    category: 'Fuel'
};

/** */
class fuelTankNormal extends fuelTank {
    /**
     * constructor - Construct a fuelTankSmall
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            config.imgPath + 'parts/fuel-tank/fuel-tank.png',
            config.buildGridSize,
            config.buildGridSize,
            x, y,
            DATA,
            'Normal Fuel Tank',
            4000);
    }
}

module.exports = fuelTankNormal;
