'use strict';

class RenderableScene {
    /**
     * constructor - Construct a renderableScene
     */
    constructor() {
        this.stage = null;
        this.renderer = null;
    }

    /**
     * init - Init the simulation. Sets up some
     * instance variables and starts running the
     * main loop
     */
    init() {
        this.resetAll();
        this.renderer.render(this.stage);
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * resetAll - Resets the stage
     * and renderer to default values.
     */
    resetAll(){
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer(
            window.innerWidth,
            window.innerHeight,
            { view: document.getElementById('canvas') }
        );
    }
}

module.exports = RenderableScene;
