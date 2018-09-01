'use strict';

const noseCone = require('../base-classes/nose-cone.js');
const config = require('../../config.js');

const DATA = {
    mass: 2250, // Mass
    drag: { // Assuming 3.71 m diameter  TODO fix this is for thruster!
        top: 10.8,
        left: 27.5 * 2,
        right: 27.5 * 2,
        bottom: 10.8
    },
    volume: 80.21 * 2, // TODO fix
    density: 52.98, // TODO fix
    description: 'A nose cone to make ur ship pointier',
    category: 'Aerodynamics'
};

/** */
class noseConeNormal extends noseCone {
    /**
     * constructor - Construct a noseConeNormal
     * @param  {number} x  X pos
     * @param  {number} y  Y pos
     */
    constructor(x, y) {
        super(
            config.imgPath + 'parts/aerodynamics/nosecone-normal.png',
            config.buildGridSize,
            config.buildGridSize,
            x, y, DATA, 'Basic nosecone');
    }
}

module.exports = noseConeNormal;
