'use strict';

const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const Camera = require('../ui/camera.js');

const allParts = require('../game/rocket-parts/all-parts.js');
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');

const EDITOR_HTML = require('./editor-html.js');

/**
 * Editor, or the shipBuilder. Handles logic
 * to construct, save, load ships.
 */
class Editor extends RenderableScene {
    /**
     * constructor - Construct an Editor
     */
    constructor() {
        super();

        // Scene and other
        this.scene = null;
        this.camera = new Camera();

        // Actions/build
        this.current_select_build = null;
        this.current_action = 'place';   // place, rotate, or move
        this.camera_focus = {x: 0, y: 0};
    }

    /**
     * init - Init the editor.
     * @override
     */
    init() {
        super.init();
        this.html = EDITOR_HTML; // Create buttons
    }

    /**
     * update - Update the editor (Per Frame)
     * @override
     */
    update() {
        this.camera.focusOn(this.camera_focus);
        this.camera.updateScene(this.stage, this.renderer);
    }

    /**
     * onClick - On click event. Places
     * ship parts and other events that
     * need to be handled with the mouse click.
     *
     * @param  {MouseEvent} e Mouse event
     * @override
     */
    onClick(e) {
        let x = e.clientX;
        let y = e.clientY;

        // Nothing selected
        if (!this.current_select_build) return;

        // Transform x and y coordinates to stage coordinates
        let pos = this.stage.toLocal(new PIXI.Point(x, y));
        [x, y] = [pos.x, pos.y];

        // Snap to smallest grid size
        x = Math.floor(x / config.build_grid_smallest) * config.build_grid_smallest;
        y = Math.floor(y / config.build_grid_smallest) * config.build_grid_smallest;

        // TODO don't add the object if the mouse X is within the button selection (ie select part buttons)
        // Parts can be draggable 

        let obj = new RocketPartGraphic(this.current_select_build, x, y);
        this.stage.addChild(obj.sprite);
    }
}

module.exports = Editor;
