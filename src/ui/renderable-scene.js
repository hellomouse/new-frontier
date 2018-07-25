'use strict';

class RenderableScene {
    /**
     * constructor - Construct a renderableScene
     */
    constructor() {
        this.stage = null;
        this.ui = null;
    }

    /**
     * init - Init the simulation. Sets up some
     * instance variables and starts running the
     * main loop
     */
    init() {
        this.resetAll();
    }

    /**
     * resetAll - Resets the stage
     * and renderer to default values.
     */
    resetAll(){
        this.stage = new PIXI.Container();
        this.ui = new PIXI.Container();
    }
}

module.exports = RenderableScene;
