'use strict';

const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');

const EDITOR_HTML = require('./editor-html.js');

class Editor extends RenderableScene {
    constructor() {
        super();

        // Make a 2D array, access like grid[y][x]
        this.grid = Array.from(Array(config.EDITOR_Y_SIZE), () => new Array(config.EDITOR_X_SIZE));

        // Game
        this.scene = null;
    }

    init() {
        super.init();

        // Create buttons
        this.html = `

        `;
    }
}
