'use strict';

const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const Camera = require('../ui/camera.js');
const control_state = require('../controls.js');

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
        this.camera = new Camera(0.3, 4, 1);

        // Actions/build
        this.current_select_build = null;
        this.current_action = 'place';   // place, rotate, or move
        this.camera_focus = {x: 0, y: 0};

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
            this.unselectCurrentBuild();
            this.unselectAll();
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

        /* Drag = always box select */
        if (control_state.mouse.dragging) {
            let initial_pos = this.stage.toLocal(
                new PIXI.Point(
                    control_state.mouse.last_mousedown[0],
                    control_state.mouse.last_mousedown[1]
                ));

            if (!control_state.keyboard.Control) this.unselectAll();

            /* Remove the rectangle graphic */
            this.removeRectangleGraphic();
            this.selectPartsBoundingBox(initial_pos.x, initial_pos.y, x, y);
            return;
        }

        /* Failed to place part, try selecting part
         * Start by finding a part at location */
        if (!this.addPart(x, y) && !this.current_select_build) this.selectPart(x, y);

        /* Success placing part!
         * Deselect everything */
        else this.unselectAll();
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
        if (name === 'Backspace' || name === 'Delete') {
            this.deleteSelection();
        }
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

        let lmdown = control_state.mouse.last_mousedown;
        let coords = this.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
        let initial_pos = this.stage.toLocal(new PIXI.Point(lmdown[0], lmdown[1]));

        let w = initial_pos.x - coords.x;
        let h = initial_pos.y - coords.y;

        /* Actual drawing */
        if (this.select_rectangle_graphic) stage_handler.getStageByName('editor').stage.removeChild(this.select_rectangle_graphic);
        this.select_rectangle_graphic = new PIXI.Graphics();

        this.select_rectangle_graphic.beginFill(0x00FF00);
        this.select_rectangle_graphic.lineStyle(1, 0x00FF00);
        this.select_rectangle_graphic.drawRect(initial_pos.x, initial_pos.y, -w, -h)
        this.select_rectangle_graphic.alpha = 0.3;

        stage_handler.getStageByName('editor').stage.addChild(this.select_rectangle_graphic);
    }

    /**
     * onScroll - On scroll event
     * @param  {Event} e      Event
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
     * @param  {Event} e      Event
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
     * unselectAll - Unselects all currently
     * selected parts.
     */
    unselectAll() {
        for (let part of this.selected_parts) {
            part.unselect();
        }
        this.selected_parts = [];
    }

    /**
     * unselectCurrentBuild - Unselects the current
     * part selected to place
     */
    unselectCurrentBuild() {
        this.current_select_build = null;
        this.updatedSelectedIcon(control_state.mouse.pos_event);
    }

    /**
     * removeRectangleGraphic - Removes select rect graphic
     */
    removeRectangleGraphic() {
        stage_handler.getStageByName('editor').stage.removeChild(this.select_rectangle_graphic);
        this.select_rectangle_graphic = null;
    }

    /**
     * selectPart - Select a part at
     * coordinates
     *
     * @param  {number} x    X pos
     * @param  {number} y    Y pos
     */
    selectPart(x, y) {
        let part = this.getPartAt(x, y);

        if (part) {
            /* If CTRL is held down add part to selection */
            if (!control_state.keyboard.Control) this.unselectAll();

            this.selected_parts.push(part);
            part.select();
        } else { /* Clicking on empty space = deselect */
            this.unselectAll();
        }
    }

    /**
     * selectPartsBoundingBox - Select all parts in a bounding box
     *
     * @param  {number} x1           Corner 1 X pos
     * @param  {number} y1           Corner 1 Y pos
     * @param  {number} x1           Corner 2 X pos
     * @param  {number} y1           Corner 2 Y pos
     */
    selectPartsBoundingBox(x1, y1, x2, y2) {
        let x_bounds = [x1, x2].sort((a, b) => a - b);
        let y_bounds = [y1, y2].sort((a, b) => a - b);

        for (let part of this.current_build) {
            if (gameUtil.math.rectIntersect(x_bounds[0], y_bounds[0], x_bounds[1], y_bounds[1],
                    part.x, part.y, part.x + part.data.width, part.y + part.data.height)) {
                this.selected_parts.push(part);
                part.select();
            }
        }
    }

    /**
     * deleteSelection - Deletes current
     * selection of parts
     */
    deleteSelection() {
        for (let part of this.selected_parts) {
            /* Delete parts from stage, graphics array and part array */
            this.stage.removeChild(part.sprite);
            delete this.current_build[this.current_build.indexOf(part)];
            //this.current_build = this.current_build.filter(p => p.x !== part.x || p.y !== p.y || p.name !== part.id);
        }

        this.selected_parts = [];
        this.current_build = this.current_build.filter(x => x !== undefined);
    }

    /**
     * addPart - Add the currently selected part
     * at given position.
     *
     * @param  {number} x X pos
     * @param  {number} y Y pos
     * @return {boolean}  Did it place
     */
    addPart(x, y) {
        if (!this.current_select_build) return false;  // Nothing selected

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
                if (x === part.x && y === part.y) return false;

                /* Intersection between another part */
                if (x < part.x + part.data.width &&
                    part.x < x + part_data.width &&
                    y < part.y + part.data.height &&
                    part.y < y + part_data.height) return false;
            }
        }

        let obj = new RocketPartGraphic(this.current_select_build, x, y);

        this.current_build.push(obj);
        this.stage.addChild(obj.sprite);

        return true;
    }

    /**
     * getPartAt - Obtain the current rocket
     * part at coordinates.
     * ONLY SELECTS UNSELECTED PARTS
     *
     * @param  {number} x            X pos
     * @param  {number} y            Y pos
     * @return {RocketPartGraphic}   Part
     */
    getPartAt(x, y) {
        for (let part of this.current_build) {
            /* Occupies identical location */
            if (x === part.x && y === part.y) return part;

            /* Intersection between another part */
            if (x < part.x + part.data.width &&
                x > part.x &&
                y < part.y + part.data.height &&
                y > part.y) return part;
        }
        return null;
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
            let x = part.x;
            let y = part.y;

            x += part.sprite.width / 2;
            y += part.sprite.height / 2;

            return new allParts.index[part.id](x, y);
        });
        let rocket = new Rocket(parts, Matter);

        rocket.reposition(90, -100); // TODO update to launch pad coords
        return rocket;
    }
}


module.exports = Editor;
