/**
 * In-game map display
 */

'use strict';

const Camera = require('../ui/camera.js');
const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');

class Map extends RenderableScene {
    /**
     * constructor - Construct a new map
     * object (No arguments)
     */
    constructor() {
        super();
        this.camera = new Camera;
    }

    /**
     * update - Run the update loop -
     * updates map graphics from simulation
     */
    update() {
        // TODO read data from sim
    }
}
