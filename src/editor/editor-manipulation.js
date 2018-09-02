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
     * @param {Editor} editor  Level editor
     */
    unselectAll (editor) {
        for (let part of editor.selected_parts) {
            part.unselect();
        }
        editor.selected_parts = [];
    },

    /**
     * unselectCurrentBuild - Unselects the current
     * part selected to place
     *
     * * @param {Editor} editor  Level editor
     */
    unselectCurrentBuild (editor) {
        editor.current_select_build = null;
        editor.updatedSelectedIcon(control_state.mouse.pos_event);
    },


    /**
     * selectPart - Select a part at
     * coordinates
     *
     * @param  {Editor} editor Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     */
    selectPart (editor, x, y) {
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
     * @param  {Editor} editor Level editor
     * @param  {number} x1     Corner 1 X pos
     * @param  {number} y1     Corner 1 Y pos
     * @param  {number} x1     Corner 2 X pos
     * @param  {number} y1     Corner 2 Y pos
     */
    selectPartsBoundingBox (editor, x1, y1, x2, y2) {
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
     * @param {Editor} editor  Level editor
     */
    deleteSelection (editor) {
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
     * @param  {Editor} editor Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     * @return {boolean}       Did it place
     */
    addPart (editor, x, y) {
        if (!editor.current_select_build) return false;  // Nothing selected

        // Snap to smallest grid size
        let part_data = allParts.index_data[editor.current_select_build];
        ({x, y} = this.snapCoordToGrid(x, y, part_data.data.min_snap_multiplier_x, part_data.data.min_snap_multiplier_y));

        // Can the part be allowed to overlap at that point?
        if (!part_data.data.can_overlap) {
            for (let part of editor.current_build) {
                /* Intersection between another part */
                let bounds = part.getBounds();

                if (gameUtil.math.rectIntersect(bounds[0], bounds[1], bounds[2], bounds[3],
                    x + 1, y + 1, x + part_data.width - 1, y + part_data.height - 1))
                        return false;
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
     * @param  {Editor} editor       Level editor
     * @param  {number} x            X pos
     * @param  {number} y            Y pos
     * @return {RocketPartGraphic}   Part
     */
    getPartAt (editor, x, y) {
        for (let part of editor.current_build) {
            /* Occupies identical location */
            if (x === part.x && y === part.y) return part;

            /* Intersection between another part */
            if (part.containsPoint(x, y)) return part;
        }
        return null;
    },

    rotateSelection90Deg(editor, angle) {
        /* No parts to rotate */
        if (editor.selected_parts.length === 0) return;

        /* Due to some bug with rotating large/negative angles,
         * it will rotate the angle in 90 DEG increments */
        angle = gameUtil.math.normalizeAngle(angle);
        while (angle >= Math.PI) {
            angle -= Math.PI / 2;
            this.rotateSelection90Deg(editor, Math.PI / 2);
        }

        let use_exact_center = true;
        let {center, largest_snap, w_range, h_range} = this.getSelectionData(editor, editor.selected_parts, use_exact_center);

        /* Radius is max X or Y difference */
        let r = Math.max(h_range[1] - h_range[0], w_range[1] - w_range[0]);

        /* Rotate each part around the center,
         * then rotate the part itself */
        for (let part of editor.selected_parts) {
            let [px, py] = [part.x, part.y];

            part.sprite.rotation = gameUtil.math.normalizeAngle(part.sprite.rotation);

            let x = -(py - center.y) + center.x;
            let y = (px - center.x) + center.y;

            ({x, y} = this.snapCoordToGrid(x, y, largest_snap.x, largest_snap.y, true));

            part.moveTo(x, y);
            part.sprite.rotation += angle;
        }
    },

    // /**
    //  * rotateSelection - Rotates the current
    //  * selection by an angle
    //  *
    //  * @param {Editor} editor  Level editor
    //  * @param {number} angle  Rotation in RAD
    //  */
    // rotateSelection (editor, angle) {
    //     /* No parts to rotate */
    //     if (editor.selected_parts.length === 0) return;
    //
    //     /* Due to some bug with rotating large/negative angles,
    //      * it will rotate the angle in 90 DEG increments */
    //     while (angle < 0) angle += Math.PI * 2;
    //     while (angle > Math.PI * 2) angle -= Math.PI * 2;
    //     while (angle >= Math.PI) {
    //         angle -= Math.PI / 2;
    //         this.rotateSelection(editor, Math.PI / 2);
    //     }
    //
    //     let use_exact_center = true;
    //     let {center, largest_snap, w_range, h_range} = this.getSelectionData(editor, editor.selected_parts, use_exact_center);
    //
    //     /* Radius is max X or Y difference */
    //     let r = Math.max(h_range[1] - h_range[0], w_range[1] - w_range[0]);
    //
    //     /* Rotate each part around the center,
    //      * then rotate the part itself */
    //     for (let part of editor.selected_parts) {
    //         let [px, py] = [part.x, part.y];
    //
    //         /* Correction factor, same as above */
    //         if (use_exact_center) {
    //             px += part.sprite.width * Math.cos(part.sprite.rotation);
    //             py += part.sprite.height * Math.sin(part.sprite.rotation);
    //         }
    //
    //         //let x = Math.cos(angle) * (px - center.x) - Math.sin(angle) * (py - center.y) + center.x;
    //         //let y = Math.sin(angle) * (px - center.x) + Math.cos(angle) * (py - center.y) + center.y;
    //
    //         //let temp = this.snapCoordToGrid(x, y, largest_snap.x, largest_snap.y, true);
    //
    //         let x = -(py - center.y) + center.x;
    //         let y = (px - center.x) + center.y;
    //
    //         part.moveTo(x, y);
    //         part.sprite.rotation += angle;
    //     }
    // },

    /**
     * getSelectionData - Get selection data for an
     * array of placed parts
     *
     * @param {Editor} editor             Level editor
     * @param  {array} parts              description
     * @param  {boolean} use_exact_center description
     * @return {object}                   See return below
     */
    getSelectionData (editor, parts, use_exact_center) {
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

        parts.forEach((part) => {
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

        return {
            center: center,                /* Center of selection {x: x, y: y} */
            largest_snap: largest_snap,    /* Grid coord multiplier to snap selection to {x: x, y: y} */
            w_range: w_range,              /* [low, high] range for x (width) values */
            h_range: h_range               /* [low, high] range for y (height) values */
        };
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
    snapCoordToGrid (x, y, snap_x, snap_y, round=false) {
        let smallest_x = snap_x * config.build_grid_size;
        let smallest_y = snap_y * config.build_grid_size;
        let f = round ? Math.round : Math.floor;

        x = f(x / smallest_x) * smallest_x;
        y = f(y / smallest_y) * smallest_y;
        return {x: x, y: y};
    }
};
