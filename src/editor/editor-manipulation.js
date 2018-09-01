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
        let part = this.getPartAt(editor, x, y);

        if (part) {
            /* If CTRL is held down add part to selection */
            if (!control_state.keyboard.Control) this.unselectAll(editor);

            editor.selected_parts.push(part);
            part.select();
        } else { /* Clicking on empty space = deselect */
            this.unselectAll(editor);
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

        // Snap to smallest grid size
        let part_data = allParts.index_data[editor.current_select_build];
        ({x, y} = this.snapCoordToGrid(x, y, part_data.data.min_snap_multiplier_x, part_data.data.min_snap_multiplier_y));

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
     * @param  {Edtior} editor       Level editor
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
        /* No parts to rotate */
        if (editor.selected_parts.length === 0) return;

        // // TODO:
        // Since we only rotate in 90 deg increments
        // recode this

        // This code only needed for grid snaping?
        /*while (angle < 0) angle += Math.PI * 2;
        while (angle > Math.PI * 2) angle -= Math.PI * 2;
        while (angle >= Math.PI) {
            angle -= Math.PI / 2;
            this.rotateSelection(editor, Math.PI / 2);
        }*/

        /* Center is the calculated rotation center
         * largest_snap is the largest x and y grid size a part
         * in the selection has.
         *
         * w_range is the lowest and highest x values
         * h_range is the lowest and highest y values */
        let center = {x: 0, y: 0};
        let largest_snap = {x: 0, y: 0};
        let w_range = [gameUtil.large, -gameUtil.large];
        let h_range = [gameUtil.large, -gameUtil.large];
        let use_exact_center = editor.selected_parts.length === 1;

        use_exact_center = true;

        editor.selected_parts.forEach((part) => {
            center.x += part.x;
            center.y += part.y;

            /* If only 1 part is selected, rotate around EXACT center.
             * For multiple parts, rotate around the approx. center
             * (Calculated from the CORNER of the sprites) as
             * using exact center causes bugs */
            if (use_exact_center) {
                center.x += part.sprite.width * Math.cos(part.sprite.rotation);
                center.y += part.sprite.height * Math.sin(part.sprite.rotation);
            }

            /* Obtain the max, min values for above variables */
            if (center.x < w_range[0]) w_range[0] = center.x;
            if (center.x > w_range[1]) w_range[1] = center.x;
            if (center.y < h_range[0]) h_range[0] = center.y;
            if (center.y > h_range[1]) h_range[1] = center.y;

            if (part.data.data.min_snap_multiplier_x > largest_snap.x)
                largest_snap.x = part.data.data.min_snap_multiplier_x;
            if (part.data.data.min_snap_multiplier_y > largest_snap.y)
                largest_snap.y = part.data.data.min_snap_multiplier_y;
        });

        /* Center is average coordinates */
        center.x = Math.round(center.x / editor.selected_parts.length);
        center.y = Math.round(center.y / editor.selected_parts.length);

        /* Radius is max X or Y difference */
        let r = Math.max(h_range[1] - h_range[0], w_range[1] - w_range[0]);

        /* Rotate each part around the center,
         * then rotate the part itself */
        for (let part of editor.selected_parts) {
            let [px, py] = [part.x, part.y];

            /* Correction factor, same as above */
            if (use_exact_center) {
                px += part.sprite.width * Math.cos(part.sprite.rotation);
                py += part.sprite.height * Math.sin(part.sprite.rotation);
            }

            let x = Math.cos(angle) * (px - center.x) - Math.sin(angle) * (py - center.y) + center.x;
            let y = Math.sin(angle) * (px - center.x) + Math.cos(angle) * (py - center.y) + center.y;

            ({x, y} = this.snapCoordToGrid(x, y, largest_snap.x, largest_snap.y, true));

            part.moveTo(x, y);
            part.sprite.rotation += angle;
        }
    },

    /**
     * snapCoordToGrid - Snaps a coordinate to the
     * nearest grid coordinate.
     *
     * @param  {number} x      X coord
     * @param  {number} y      Y coord
     * @param  {number} snap_x Snap x multiplier (ie 1 = whole grid)
     * @param  {number} snap_y Snap y multiplier (ie 1 = whole grid)
     * @param  {boolean} round Round to nearest grid instead of flooring
     * @return {object}        {x: <number>, y: <number>} New coord
     */
    snapCoordToGrid(x, y, snap_x, snap_y, round=false) {
        return {x: x, y: y};

        let smallest_x = snap_x * config.build_grid_size;
        let smallest_y = snap_y * config.build_grid_size;
        let f = round ? Math.round : Math.floor;

        x = f(x / smallest_x) * smallest_x;
        y = f(y / smallest_y) * smallest_y;
        return {x: x, y: y};
    }
};
