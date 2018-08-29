'use strict';

const NoseCone = require('../base-classes/nose-cone.js');
const config = require('../../config.js');

const DATA = {
    mass: 2250,  // Mass
    drag: {             // Assuming 3.71 m diameter  TODO fix this is for thruster!
        top: 10.8,
        left: 27.5 * 2,
        right: 27.5 * 2,
        bottom: 10.8
    },
    volume: 80.21 * 2,  //TODO fix
    density: 52.98,  //TODO fix
    description: 'A nose cone to make ur ship pointier',
    category: 'Aerodynamics'
};

class NoseConeNormal extends NoseCone {
    /**
     * constructor - Construct a NoseConeNormal
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            config.IMG_PATH + 'parts/aerodynamics/nosecone-normal.png',
            config.build_grid_size,
            config.build_grid_size,
            x, y, DATA, 'Basic Nosecone');
    }
}

module.exports = NoseConeNormal;
