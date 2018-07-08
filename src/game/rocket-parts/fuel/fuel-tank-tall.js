'use strict';

const FuelTank = require('../base-classes/fuel-tank.js');
const config = require('../../config.js');

class FuelTankTall extends FuelTank {
    /**
     * constructor - Construct a FuelTankSmall
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            '../assets/parts/fuel-tank.png',
            config.build_grid_size,
            config.build_grid_size * 2,
            x, y,
            {
                mass: 2000 * 4 + 2250 * 4,  // Mass includes fuel mass
                drag: {             // Assuming 3.71 m diameter
                    top: 10.8,
                    left: 27.5 * 4,
                    right: 27.5 * 4,
                    bottom: 10.8
                },
                volume: 80.21 * 4,
                density: 52.98,  // Including fuel
                description: 'A fuel tank carrying liquid fuel and oxygen. Explosive.'
            },
            8000);  // Fuel mass
            
        this.id = 'Tall Fuel Tank';
    }
}

module.exports = FuelTankTall;
