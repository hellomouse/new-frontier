'use strict';

const Planet = require('../../game-components/planet.js');

class Earth extends Planet {
    constructor(x, y) {
        super(x, y);

        this.radius = 1000000;
        this.mass = 100000;

        this.createBody();
        this.body.mass = 500 //5.972 * 10**24 (Real value freezes application - Need workaround to handle large values and forces)
    }

    update() {
        //Pretend to be a physicalsprite
    }
}

module.exports = Earth;
