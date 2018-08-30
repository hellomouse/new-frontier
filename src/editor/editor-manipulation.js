/* Manipulation of parts in the editor, such as adding,
 * removing, transforming parts */

'use strict';

/* Util and other required */
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const control_state = require('../controls.js');

/* Parts imports */
const allParts = require('../game/rocket-parts/all-parts.js');
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');
const Rocket = require('../game/rocket.js');


/**
 * Functions to manipulate rocket parts
 */
module.exports = {
    /**
     * unselectAll - Unselects all currently
     * selected parts.
     *
     * @param {Edtior} editor  Level editor
     */
    unselectAll: function (editor) {
        for (let part of editor.selected_parts) {
            part.unselect();
        }
        editor.selected_parts = [];
    },

    /**
     * unselectCurrentBuild - Unselects the current
     * part selected to place
     *
     * * @param {Edtior} editor  Level editor
     */
    unselectCurrentBuild: function (editor) {
        editor.current_select_build = null;
        editor.updatedSelectedIcon(control_state.mouse.pos_event);
    },


    /**
     * selectPart - Select a part at
     * coordinates
     *
     * @param {Edtior} editor  Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     */
    selectPart: function (editor, x, y) {
        let part = this.getPartAt(x, y);

        if (part) {
            /* If CTRL is held down add part to selection */
            if (!control_state.keyboard.Control) this.unselectAll();

            editor.selected_parts.push(part);
            part.select();
        } else { /* Clicking on empty space = deselect */
            this.unselectAll();
        }
    },

    /**
     * selectPartsBoundingBox - Select all parts in a bounding box
     *
     * @param {Edtior} editor  Level editor
     * @param  {number} x1     Corner 1 X pos
     * @param  {number} y1     Corner 1 Y pos
     * @param  {number} x1     Corner 2 X pos
     * @param  {number} y1     Corner 2 Y pos
     */
    selectPartsBoundingBox: function (editor, x1, y1, x2, y2) {
        let x_bounds = [x1, x2].sort((a, b) => a - b);
        let y_bounds = [y1, y2].sort((a, b) => a - b);

        for (let part of editor.current_build) {
            if (gameUtil.math.rectIntersect(x_bounds[0], y_bounds[0], x_bounds[1], y_bounds[1],
                    part.x, part.y, part.x + part.data.width, part.y + part.data.height)) {
                editor.selected_parts.push(part);
                part.select();
            }
        }
    },

    /**
     * deleteSelection - Deletes current
     * selection of parts
     *
     * @param {Edtior} editor  Level editor
     */
    deleteSelection: function (editor) {
        for (let part of editor.selected_parts) {
            /* Delete parts from stage, graphics array and part array */
            editor.stage.removeChild(part.sprite);
            delete editor.current_build[editor.current_build.indexOf(part)];
            //editor.current_build = editor.current_build.filter(p => p.x !== part.x || p.y !== p.y || p.name !== part.id);
        }

        editor.selected_parts = [];
        editor.current_build = editor.current_build.filter(x => x !== undefined);
    },

    /**
     * addPart - Add the currently selected part
     * at given position.
     *
     * @param {Edtior} editor  Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     * @return {boolean}       Did it place
     */
    addPart: function(editor, x, y) {
        if (!editor.current_select_build) return false;  // Nothing selected

        let part_data = allParts.index_data[editor.current_select_build];

        // Snap to smallest grid size
        let smallest_x = part_data.data.min_snap_multiplier_x * config.build_grid_size;
        let smallest_y = part_data.data.min_snap_multiplier_y * config.build_grid_size;

        x = Math.floor(x / smallest_x) * smallest_x;
        y = Math.floor(y / smallest_y) * smallest_y;

        // Can the part be allowed to overlap at that point?
        if (!part_data.data.can_overlap) {
            for (let part of editor.current_build) {
                /* Occupies identical location */
                if (x === part.x && y === part.y) return false;

                /* Intersection between another part */
                if (x < part.x + part.data.width &&
                    part.x < x + part_data.width &&
                    y < part.y + part.data.height &&
                    part.y < y + part_data.height) return false;
            }
        }

        let obj = new RocketPartGraphic(editor.current_select_build, x, y);

        editor.current_build.push(obj);
        editor.stage.addChild(obj.sprite);

        return true;
    },

    /**
     * getPartAt - Obtain the current rocket
     * part at coordinates.
     * ONLY SELECTS UNSELECTED PARTS
     *
     * @param {Edtior} editor        Level editor
     * @param  {number} x            X pos
     * @param  {number} y            Y pos
     * @return {RocketPartGraphic}   Part
     */
    getPartAt: function (editor, x, y) {
        for (let part of editor.current_build) {
            /* Occupies identical location */
            if (x === part.x && y === part.y) return part;

            /* Intersection between another part */
            if (x < part.x + part.data.width &&
                x > part.x &&
                y < part.y + part.data.height &&
                y > part.y) return part;
        }
        return null;
    },

    /**
     * rotateSelection - Rotates the current
     * selection by an angle
     *
     * @param {Edtior} editor  Level editor
     * @param  {number} angle  Rotation in RAD
     */
    rotateSelection: function (editor, angle) {
        if (editor.selected_parts.length === 0) return;

        let center = {x: 0, y: 0};
        let h_range = [999999999, -9999999999999];
        let w_range = [9999999999, -999999999];
        let largest_snap = {x: 0, y: 0};

        editor.selected_parts.forEach((a) => {
            center.x += a.x;
            center.y += a.y;

            if (center.x < w_range[0]) w_range[0] = center.x;
            if (center.x > w_range[1]) w_range[1] = center.x;
            if (center.y < h_range[0]) h_range[0] = center.y;
            if (center.y > h_range[1]) h_range[1] = center.y;

            if (a.data.data.min_snap_multiplier_x > largest_snap.x)
                largest_snap.x = a.data.data.min_snap_multiplier_x;
            if (a.data.data.min_snap_multiplier_y > largest_snap.y)
                largest_snap.y = a.data.data.min_snap_multiplier_y;
        });
        center.x /= editor.selected_parts.length;
        center.y /= editor.selected_parts.length;

        let r = Math.max(h_range[1] - h_range[0], w_range[1] - w_range[0]);

        /* Rotate each part around the center,
         * then rotate the part itself */
        for (let part of editor.selected_parts) {
            let smallest_x = largest_snap.x * config.build_grid_size;
            let smallest_y = largest_snap.x * config.build_grid_size;

            let x = Math.cos(angle) * (part.x - center.x) - Math.sin(angle) * (part.y - center.y) + center.x;
            let y = Math.sin(angle) * (part.x - center.x) + Math.cos(angle) * (part.y - center.y) + center.y;

            x = Math.floor(x / smallest_x) * smallest_x;
            y = Math.floor(y / smallest_y) * smallest_y;

            part.moveTo(x, y);
            part.sprite.rotation += angle;
        }
    }
};
