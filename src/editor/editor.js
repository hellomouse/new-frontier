'use strict';

const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const Camera = require('../ui/camera.js');

const EDITOR_HTML = require('./editor-html.js');

class Editor extends RenderableScene {
    constructor() {
        super();

        // Make a 2D array, access like grid[y][x]
        this.grid = Array.from(Array(config.EDITOR_Y_SIZE), () => new Array(config.EDITOR_X_SIZE));

        // Scene and other
        this.scene = null;
        this.camera = new Camera();

        // Actions/build
        this.current_select_build = null;
        this.current_action = 'place';   // place, rotate, or move
    }

    init() {
        super.init();

        // Create buttons
        this.html = EDITOR_HTML;
    }

    update() {
        this.camera.focusOn({x: 0, y: 0});
        this.camera.updateScene(this.stage, this.renderer);
    }

    onClick(e) {
        let x = e.clientX;
        let y = e.clientY;
    }
}

module.exports = Editor;