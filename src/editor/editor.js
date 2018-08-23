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
        this.camera = new Camera(0.3, 50, 1);

        // Actions/build
        this.current_select_build = null;
        this.current_action = 'place';   // place, rotate, or move
        this.camera_focus = {x: 0, y: 0};
        this.current_build = [];
    }

    /**
     * init - Init the editor.
     * @override
     */
    init() {
        super.init();
        this.html = EDITOR_HTML; // Create buttons

        let lines = new PIXI.Graphics();
        this.stage.addChild(lines);

        /* DEBUG */
        for (let x = -config.build_grid_size * 20; x < 1000; x += config.build_grid_size) {
            lines.lineStyle(3, 0xffffff)
                   .moveTo(x, -1000)
                   .lineTo(x, 1000);
        }
        for (let y = -config.build_grid_size * 20; y < 1000; y += config.build_grid_size) {
            lines.lineStyle(3, 0xffffff)
                   .moveTo(-1000, y)
                   .lineTo(1000, y);
        }
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

        /* X coordinate is on the left side of the screen
         * (User is selecting parts and not placing down parts)
         * Or Y coordinate is top 50 px */
        if (x < 350) return;  // See editor-html.js, add the width of the 2 divs
        if (y < 50) return;

        // Transform x and y coordinates to stage coordinates
        let pos = this.stage.toLocal(new PIXI.Point(x, y));
        [x, y] = [pos.x, pos.y];

        this.addPart(x, y);

        //TODO
        // Parts can be draggable
    }

    /**
     * addPart - Add the currently selected part
     * at given position
     *
     * @param  {number} x X pos
     * @param  {number} y Y pos
     */
    addPart(x, y) {
        let part_data = allParts.index_data[this.current_select_build];

        // Snap to smallest grid size
        let smallest_x = part_data.data.min_snap_multiplier_x * config.build_grid_size;
        let smallest_y = part_data.data.min_snap_multiplier_y * config.build_grid_size;

        x = Math.floor(x / smallest_x) * smallest_x;
        y = Math.floor(y / smallest_y) * smallest_y;

        // Can the part be allowed to overlap at that point?
        if (!part_data.data.can_overlap) {
            for (let part of this.current_build) {
                /* Occupies identical location */
                if (x === part.x && y === part.y) return;

                /* Intersection between another part */
                if (x < part.x + part.data.width &&
                    part.x < x + part_data.width &&
                    y < part.y + part.data.height &&
                    part.y < y + part_data.height) return;
            }
        }

        let obj = new RocketPartGraphic(this.current_select_build, x, y);
        this.stage.addChild(obj.sprite);

        this.current_build.push({ x: x, y: y, name: this.current_select_build, data: part_data });
    }

    /**
     * constructRocket - Construct a new Rocket object
     * that can be added to the sim
     *
     * @return {Rocket}  Rocket built in the editor
     */
    constructRocket() {
        let parts = this.current_build.map(part => new allParts.index[part.name](part.x, part.y));
        let rocket = new Rocket(parts, Matter);

        rocket.reposition(90, -100); // TODO update to launch pad coords
        return rocket;
    }
}

module.exports = Editor;
