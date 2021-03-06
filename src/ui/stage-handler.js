'use strict';

class StageHandler {
    constructor() {
        this.current_stage = 'sim';
        this.stages = {};

        this.renderer = PIXI.autoDetectRenderer(
            window.innerWidth,
            window.innerHeight,
            { view: document.getElementById('canvas') }
        );
    }

    init() {
        for (let key of Object.keys(this.stages)) {
            this.stages[key].renderer = this.renderer;
            this.stages[key].init();
        }
    }

    startRender() {
        this.renderer.render(this.stages[this.current_stage].stage);
        requestAnimationFrame(this.update.bind(this));
    }

    update() {
        let current = this.stages[this.current_stage];
        current.update();

        this.renderer.render(current.stage);
        requestAnimationFrame(this.update.bind(this));
    }

    getCurrentStage() {
        return this.stages[this.current_stage];
    }

    getStageByName(name) {
        return this.stages[name];
    }

    switchStage(name) {
        this.current_stage = name;
        this.getCurrentStage().load();
    }
}

module.exports = StageHandler;
