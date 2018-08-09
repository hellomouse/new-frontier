'use strict';

class RenderableScene {
    /**
     * constructor - Construct a renderableScene
     */
    constructor() {
        this.stage = null;
        this.ui = null;
        this.html = '';
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

    /**
     * load - Additional loading that may need to
     * occur for the scene when switched to.
     * Override this method if needed
     */
    load() {
        document.getElementById('ui-overlay').innerHTML = this.html;
    }

    /**
     * unload - Called when the scene is unloaded.
     * Override this method if needed
     */
    unload() {
        // Empty, override
    }

    /**
     * update - Update - called each frame
     * Override if needed
     */
    update() {
        // Empty, override
    }

    /**
     * onScroll - Runs on the mousescroll event
     * @param  {Event} e Event
     */
    onScroll(e) {
        // Empty, override
    }

    /**
     * onClick - Runs on the mouseclick event
     * @param  {Event} e Event
     */
    onClick(e) {
        // Empty, override
    }
}

module.exports = RenderableScene;
