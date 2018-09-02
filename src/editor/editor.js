'use strict';

/* Util and other required */
const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const Camera = require('../ui/camera.js');
const control_state = require('../controls.js');
const editor_man = require('./editor-manipulation.js');

/* Parts imports */
const allParts = require('../game/rocket-parts/all-parts.js');
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');
const Rocket = require('../game/rocket.js');

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
        this.camera = new Camera(0.1, 4, 1);

        // Actions/build
        this.current_select_build = null;
        this.swipe = false;  // Swipe enabled is drag a select box, otherwise camera drag

        // Camera
        this.camera_focus = {x: 0, y: 0};
        this.camera_focus_initial = {x: 0, y: 0};

        this.current_build = [];
        this.selected_parts = [];

        /* Width of left side of editor (selectors)
         * Since HTML is not yet loaded will be loaded on click */
        this.left_part_width = null;
        this.top_part_height = null;

        /* Select rectangle graphic */
        this.select_rectangle_graphic = null;
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
            lines.lineStyle(1, 0xffffff)
                   .moveTo(x, -1000)
                   .lineTo(x, 1000);
        }
        for (let y = -config.build_grid_size * 20; y < 1000; y += config.build_grid_size) {
            lines.lineStyle(1, 0xffffff)
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
     * processMouseCoordinates - Given a click
     * event, processes the coordinates to the current canvas.
     *
     * @param  {MouseEvent} e Mouse event
     * @return {array}        [x, y] processed
     */
    processMouseCoordinates(e) {
        let x = e.clientX;
        let y = e.clientY;

        /* Add variables if doesn't exist */
        if (!this.left_part_width) {
            this.left_part_width = +document.getElementById('editor-left-1').style.width.replace('px', '') +
            +document.getElementById('parts').style.width.replace('px', '');
        }
        if (!this.top_part_height) {
            this.top_part_height = +document.getElementById('editor-top').style.height.replace('px', '');
        }

        /* X coordinate is on the left side of the screen
         * (User is selecting parts and not placing down parts)
         * Or Y coordinate is top 50 px */
        if (x < this.left_part_width || y < this.top_part_height) {  // See editor-html.js, add the width of the 2 divs
            editor_man.unselectCurrentBuild(this);
            editor_man.unselectAll(this);
            return;
        }

        // Transform x and y coordinates to stage coordinates
        let pos = this.stage.toLocal(new PIXI.Point(x, y));
        return [pos.x, pos.y];
    }

    /**
     * onLeftClick - On click event. Places
     * ship parts and other events that
     * need to be handled with the mouse click.
     *
     * @param  {MouseEvent} e Mouse event
     * @override
     */
    onLeftClick(e) {
        let coords = this.processMouseCoordinates(e);
        if (!coords) return;

        let [x, y] = coords;

        /* Left mouse click
         * Adds part at <x, y> */

        /* Drag - box select or camera move */
        if (control_state.mouse.dragging) {
            let initial_pos = this.stage.toLocal(
                new PIXI.Point(
                    control_state.mouse.last_mousedown[0],
                    control_state.mouse.last_mousedown[1]
                ));

            if (this.swipe) {
                if (!control_state.keyboard.Control) editor_man.unselectAll(this);

                /* Remove the rectangle graphic */
                this.removeRectangleGraphic();
                editor_man.selectPartsBoundingBox(this,initial_pos.x, initial_pos.y, x, y);
            } else {
                this.camera_focus_initial.x = this.camera_focus.x;
                this.camera_focus_initial.y = this.camera_focus.y;
            }
            return;
        }

        /* Failed to place part, try selecting part
         * Start by finding a part at location */
        if (!editor_man.addPart(this, x, y) && !this.current_select_build) editor_man.selectPart(this, x, y);

        /* Success placing part!
         * Deselect everything */
        else editor_man.unselectAll(this);

        this.camera_focus_initial.x = this.camera_focus.x;
        this.camera_focus_initial.y = this.camera_focus.y;
    }

    /**
     * onRightClick - Open the special menu
     * for ship parts (If they have one)
     *
     * @param  {MouseEvent} e Mouse event
     * @override
     */
    onRightClick(e) {
        /* Right mouse click
         * Options for part at <x, y> */
        let coords = this.processMouseCoordinates(e);
        if (!coords) return;
        let [x, y] = coords;
    }

    /**
     * onKeyDown - Runs on the keydown event
     * @param  {Event} e      Event
     * @param  {string} name  Key name
     * @override
     */
    onKeyDown(e, name) {
        switch (name) {
            /* Delete selection */
            case 'Backspace':
            case 'Delete': {
                editor_man.deleteSelection(this);
                break;
            }

            /* Rotate selection left and right respectively */
            case 'q':
            case 'e': {
                editor_man.rotateSelection90Deg(this, (name === 'e' ? 1 : -1) * Math.PI / 2, true);
                break;
            }

            /* Move camera left, up, down or right */
            case 'a': case 'ArrowLeft':
            case 's': case 'ArrowDown':
            case 'w': case 'ArrowUp':
            case 'd': case 'ArrowRight': {
                let dpos = gameUtil.controls.WASDToDxDy(
                    Math.max.apply(null, this.selected_parts.map(p => p.data.data.min_snap_multiplier_x)) * config.build_grid_size,
                    Math.max.apply(null, this.selected_parts.map(p => p.data.data.min_snap_multiplier_y)) * config.build_grid_size,
                    name);

                for (let part of this.selected_parts)
                    part.moveToRelative(dpos.dx, dpos.dy);
                break;
            }
        }

        // /* Camera can't go out of bounds */
        // if (Math.abs(this.camera_focus.x + dpos.dx) > config.build_grid_boundary ||
        //     Math.abs(this.camera_focus.y + dpos.dy) > config.build_grid_boundary) return;
        //
        // this.camera_focus.x += dpos.dx;
        // this.camera_focus.y += dpos.dy;
    }


    /**
     * onMousemove - Runs on mousemove
     * @param  {Event} e      Event
     * @override
     */
    onMousemove(e) {
        if (!e) return; // Outside of screen
        this.updatedSelectedIcon(e);  // Updated selected icon

        /* Draw the select rectangle that shows the selection */
        if (!control_state.mouse.isdown) {
            this.removeRectangleGraphic();
            return;
        }

        let coords = this.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
        let lmdown = control_state.mouse.last_mousedown;
        let initial_pos = this.stage.toLocal(new PIXI.Point(lmdown[0], lmdown[1]));

        /* Draw the selection rectangle */
        if (this.swipe) this.drawSelectionRectangle(e, coords, initial_pos)
        else {
            this.camera_focus.x = this.camera_focus_initial.x + initial_pos.x - coords.x;
            this.camera_focus.y = this.camera_focus_initial.y + initial_pos.y - coords.y;

            if (Math.abs(this.camera_focus.x) > config.build_grid_boundary)
                this.camera_focus.x = gameUtil.math.copySign(this.camera_focus.x) * config.build_grid_boundary;
            if (Math.abs(this.camera_focus.y) > config.build_grid_boundary)
                this.camera_focus.y = gameUtil.math.copySign(this.camera_focus.y) * config.build_grid_boundary;
        }
    }

    /**
     * onScroll - On scroll event
     * @param  {Event} e  Event
     * @override
     */
    onScroll(e) {
        this.updatedSelectedIcon(e);
    }

    /**
     * updatedSelectedIcon - Update the current
     * little mouse icon that displays the part
     * that is selected
     *
     * @param  {Event} e  Event
     */
    updatedSelectedIcon(e) {
        if (!e) return;

        let icon = document.getElementById('follow-mouse-editor-icon');

        if (!this.current_select_build) {
            icon.style.display = 'none';
            return;
        }

        let x = e.clientX;
        let y = e.clientY;
        let data = allParts.index_data[this.current_select_build];

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        icon.src = data.image_path;

        icon.style.width = data.width * this.camera.scale + 'px';
        icon.style.height = data.height * this.camera.scale + 'px';
        icon.style.display = 'inline';
    }

    /**
     * handleSelectionRectangle - Draws the selection rectangle
     *
     * @param  {Event} e                Event
     * @param  {PIXI.Point} coords      Coord of mouse (to local stage)
     * @param  {PIXI.Point} initial_pos Coord of last mouse down (to local stage)
     */
    drawSelectionRectangle(e, coords, initial_pos) {
        let w = initial_pos.x - coords.x;
        let h = initial_pos.y - coords.y;

        if (this.select_rectangle_graphic) stage_handler.getStageByName('editor').stage.removeChild(this.select_rectangle_graphic);
        this.select_rectangle_graphic = new PIXI.Graphics();

        this.select_rectangle_graphic.beginFill(0x00FF00);
        this.select_rectangle_graphic.lineStyle(1, 0x00FF00);
        this.select_rectangle_graphic.drawRect(initial_pos.x, initial_pos.y, -w, -h)
        this.select_rectangle_graphic.alpha = 0.3;

        stage_handler.getStageByName('editor').stage.addChild(this.select_rectangle_graphic);
    }

    /**
     * removeRectangleGraphic - Removes select rect graphic
     */
    removeRectangleGraphic() {
        stage_handler.getStageByName('editor').stage.removeChild(this.select_rectangle_graphic);
        this.select_rectangle_graphic = null;
    }

    /**
     * constructRocket - Construct a new Rocket object
     * that can be added to the sim
     *
     * @return {Rocket}  Rocket built in the editor
     */
    constructRocket() {
        let parts = this.current_build.map(part => {
            /* Adjust from corner coordinates to
             * centered coordinates */
            let x = part.x + part.sprite.width / 2;
            let y = part.y + part.sprite.height / 2;
            let returned = new allParts.index[part.id](x, y);

            returned.setSpriteRotation(part.sprite.rotation);

            return returned;
        });
        let rocket = new Rocket(parts, Matter);

        rocket.reposition(90, -100); // TODO update to launch pad coords
        return rocket;
    }
}


module.exports = Editor;
