'use strict';

const FuelTank = require('../base-classes/fuel-tank.js');
const config = require('../../config.js');

class FuelTankNormal extends FuelTank {
    /**
     * constructor - Construct a FuelTankSmall
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            '../assets/parts/fuel-tank.png',
            config.build_grid_size,
            config.build_grid_size,
            x, y,
            {
                mass: 2000 * 2 + 2250 * 2,  // Mass includes fuel mass
                drag: {             // Assuming 3.71 m diameter``
                    top: 10.8,
                    left: 27.5 * 2,
                    right: 27.5 * 2,
                    bottom: 10.8
                },
                volume: 80.21 * 2,
                density: 52.98,  // Including fuel
                description: 'A fuel tank carrying liquid fuel and oxygen. Explosive.'
            },
            4000);  // Fuel mass

        this.id = 'Normal Fuel Tank';
    }
}

module.exports = FuelTankNormal;
