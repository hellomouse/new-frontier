'use strict';

const Planet = require('../../game-components/planet.js');

class Earth extends Planet {
    constructor(x, y) {
        super(x, y);

        this.radius = 1000000;
        this.mass = 100000;

    }

    update() {
        //Pretend to be a physicalsprite
    }
}

module.exports = Earth;
