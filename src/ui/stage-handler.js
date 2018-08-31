'use strict';

/**
 * Manages all stages
 */
class StageHandler {
    /** @constructor */
    constructor() {
        this.currentStage = 'sim';
        this.stages = {};

        this.renderer = PIXI.autoDetectRenderer(
            window.innerWidth,
            window.innerHeight,
            { view: document.getElementById('canvas') }
        );
    }

    /** Second contructor after prelims have been done */
    init() {
        for (let key of Object.keys(this.stages)) {
            this.stages[key].renderer = this.renderer;
            this.stages[key].init();
        }
    }

    /** Start rendering the scene */
    startRender() {
        this.renderer.render(this.stages[this.currentStage].stage);
        requestAnimationFrame(this.update.bind(this));
    }

    /** Render the stage every tick */
    update() {
        let current = this.stages[this.currentStage];
        current.update();

        this.renderer.render(current.stage);
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Returns current active stage
     * @return {object} stage
     */
    getCurrentStage() {
        return this.stages[this.currentStage];
    }

    /**
     * Lookup of stage via name
     * @param {string} name - stage to lookup
     * @return {object} stage
     */
    getStageByName(name) {
        return this.stages[name];
    }

    /**
     * Switch active stage to another
     * @param {string} name - Name of stage to switch to
     */
    switchStage(name) {
        this.currentStage = name;
        this.getCurrentStage().load();
    }
}

module.exports = StageHandler;
