'use strict';

/** It's a renderableScene */
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
    resetAll() {
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
     * onLeftClick - Runs on the mouseup event (left)
     * @param  {Event} e Event
     */
    onLeftClick(e) {
        // Empty, override
    }

    /**
     * onRightClick - Runs on the mouseup event (right)
     * @param  {Event} e Event
     */
    onRightClick(e) {
        // Empty, override
    }

    /**
     * onRightClick - Runs on the mousedown event
     * @param  {Event} e Event
     */
    onMousemove(e) {
        // Empty, override
    }

    /**
     * onKeyDown - Runs on the keydown event
     * @param  {Event} e      Event
     * @param  {string} name  Key name
     */
    onKeyDown(e, name) {
        // Empty, override
    }
}

module.exports = RenderableScene;
