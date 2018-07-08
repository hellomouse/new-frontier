'use strict';

const FuelTank = require('../base-classes/fuel-tank.js');
const config = require('../../config.js');

class FuelTankSmall extends FuelTank {
    /**
     * constructor - Construct a FuelTankSmall
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            '../assets/parts/fuel-tank.png',
            config.build_grid_size,
            config.build_grid_size / 2,
            x, y,
            {
                mass: 2000 + 2250,  // Mass includes fuel mass
                drag: {             // Assuming 3.71 m diameter
                    top: 10.8,
                    left: 27.5,
                    right: 27.5,
                    bottom: 10.8
                },
                volume: 80.21,
                density: 52.98,  // Including fuel
                description: 'A fuel tank carrying liquid fuel and oxygen. Explosive.'
            },
            2000);  // Fuel mass

        this.id = 'Small Fuel Tank';
    }
}

module.exports = FuelTankSmall;
