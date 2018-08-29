/* Literally identical to planet.js, except it's under
 * a class called "Moon" */

'use strict';

const Planet = require('./planet.js');

/**
 * There is no difference between a Moon
 * and a Planet other than class type. See
 * planet.js
 */
class Moon extends Planet {
    /**
     * constructor - Construct a Moon
     *
     * @param  {number} x X coordinate of spawn
     * @param  {number} y Y coordinate of spawn
     */
    constructor(x, y) {
        super(x, y);
    }
}

module.exports = Moon;
