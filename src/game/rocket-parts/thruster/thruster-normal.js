'use strict';

const Thruster = require('../base-classes/thruster.js');
const config = require('../../config.js');

const DATA = {
    mass: 2250, // Mass
    drag: { // Assuming 3.71 m diameter  TODO fix
        top: 10.8,
        left: 27.5 * 2,
        right: 27.5 * 2,
        bottom: 10.8
    },
    volume: 80.21 * 2, // TODO fix
    density: 52.98, // TODO fix
    description: 'A high thrust, low efficiency engine. Normally used in the lower stages of a rocket.',
    category: 'Thruster'
};

class ThrusterNormal extends Thruster {
    /**
     * constructor - Construct a ThrusterNormal
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            config.IMG_PATH + 'parts/thruster/thruster-normal.png',
            config.build_grid_size,
            config.build_grid_size,
            x, y, DATA, 'Liquid Fuel Engine',
            0.01, 0.1);
    }
}

module.exports = ThrusterNormal;
