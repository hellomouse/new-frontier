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
        let part = this.getPartAt(editor, x, y, true);

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
     * selectPartObject - Select a part given
     * reference to the part
     *
     * @param  {Editor} editor            Level editor
     * @param  {RocketPartgraphic} obj    Obj to select
     * @param  {boolean} ignoreCtrl=false Ignore the ctrl check
     */
    selectPartObject (editor, obj, ignoreCtrl=false) {
        /* If CTRL is held down add part to selection */
        if (!control_state.keyboard.Control && !ignoreCtrl) this.unselectAll(editor);

        editor.selected_parts.push(obj);
        obj.select();
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

        editor.addCurrentStateToStack();
    },

    /**
     * deleteAll - Deletes all objects currently
     * in the editor.
     *
     * @param {Editor} editor       Level editor
     * @param {boolean} undo=true  Save as undo action?
     */
    deleteAll(editor, undo=true) {
        for (let part of editor.current_build) {
            /* Delete parts from stage, graphics array and part array */
            editor.stage.removeChild(part.sprite);
            delete editor.current_build[editor.current_build.indexOf(part)];
        }
        editor.current_build = [];
        editor.selected_parts = [];

        if (undo) editor.addCurrentStateToStack();
    },

    /**
     * addPart - Add the currently selected part
     * at given position.
     *
     * @param  {Editor} editor Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     * @param  {boolean} force Force placement?
     * @param {boolean} undo=true  Save as undo action?
     * @return {boolean}       Did it place
     */
    addPart (editor, x, y, force=false, undo=true) {
        if (!editor.current_select_build) return false;  // Nothing selected

        // Snap to smallest grid size
        let part_data = allParts.index_data[editor.current_select_build];
        let angle = gameUtil.math.normalizeAngle(Math.PI / 2 * editor.placement_rotation);
        let obj = new RocketPartGraphic(editor.current_select_build, x, y);

        obj.sprite.rotation = angle;

        let a = Math.round(angle / (Math.PI / 2));

        if ( a === 1) {
            x += part_data.height;
        }
        else if (a === 2) {
            x += part_data.width;
            y += part_data.height;
        } else if (a === 3) {
            y += part_data.width;
        }

        ({x, y} = this.snapCoordToGrid(x, y, part_data.data.min_snap_multiplier_x, part_data.data.min_snap_multiplier_y));

        obj.moveTo(x, y);

        // Can the part be allowed to overlap at that point?
        if (!part_data.data.can_overlap && !force) {
            for (let part of editor.current_build) {
                /* Intersection between another part */
                let bounds = part.getBounds();
                let bounds2 = obj.getBounds();

                if (gameUtil.math.rectIntersect(bounds[0], bounds[1], bounds[2], bounds[3],
                    bounds2[0] + 1, bounds2[1] + 1, bounds2[2] - 1, bounds2[3] - 1))
                        return false;

            }
        }

        editor.current_build.push(obj);
        editor.stage.addChild(obj.sprite);

        if (undo) editor.addCurrentStateToStack();

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
     * @param  {boolean} notselected=false Only select unselected parts?
     * @return {RocketPartGraphic}   Part
     */
    getPartAt (editor, x, y, notselected=false) {
        for (let part of editor.current_build) {
            if (notselected && part.selected) continue;

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

        this.rotateParts90Deg(editor.selected_parts, angle);
        editor.addCurrentStateToStack();
    },

    rotateParts90Deg(parts, angle) {
        /* Due to some bug with rotating large/negative angles,
         * it will rotate the angle in 90 DEG increments */
        angle = gameUtil.math.normalizeAngle(angle);
        while (angle >= Math.PI) {
            angle -= Math.PI / 2;
            this.rotateParts90Deg(parts, Math.PI / 2);
        }

        let {center, largest_snap, w_range, h_range} = this.getSelectionData(parts, true);

        /* Radius is max X or Y difference */
        let r = Math.max(h_range[1] - h_range[0], w_range[1] - w_range[0]);

        /* Rotate each part around the center,
         * then rotate the part itself */
        for (let part of parts) {
            let [px, py] = [part.x, part.y];

            part.sprite.rotation = gameUtil.math.normalizeAngle(part.sprite.rotation);

            /* Fix for rotating single parts in place */
            if (parts.length === 1) {
                px += part.sprite.width *  gameUtil.math.quadCos(part.sprite.rotation);
                py += part.sprite.height * gameUtil.math.quadSin(part.sprite.rotation);
            }

            let x = -(py - center.y) + center.x;
            let y = (px - center.x) + center.y;

            ({x, y} = this.snapCoordToGrid(x, y, largest_snap.x, largest_snap.y, true));

            part.moveTo(x, y);
            part.sprite.rotation += angle;
        }
    },

    /**
     * mirrorSelection - Mirror the current selection
     *
     * @param  {type} editor        description
     * @param  {type} vertical=true description
     * @return {type}               description
     */
    mirrorSelection(editor, vertical=true) {
        /* No parts to rotate */
        if (editor.selected_parts.length === 0) return;

        let {w_range, h_range} = this.getSelectionData( editor.selected_parts);
        let cx = (w_range[0] + w_range[1]) / 2;
        let cy = (h_range[0] + h_range[1]) / 2;

        /* Rotate each part around the center,
         * then rotate the part itself */
        for (let part of editor.selected_parts) {
            let [px, py] = [part.x, part.y];

            console.log(cx, px, cx - px + cx, - part.getRealWidth())

            if (vertical) py = cy - py + cy - part.getRealHeight();
            else          px = cx - px + cx - part.getRealWidth();

            part.moveTo(px, py);




            //TODO symmetry checks
            /*if (part.sprite.width === config.build_grid_size &&
                part.sprite.height === config.build_grid_size) {

                let a = Math.round(part.sprite.rotation / Math.PI * 2);
                if (vertical && [0,2, 4].includes(a)) {
                    this.rotateParts90Deg([part], Math.PI / 2);
                    this.rotateParts90Deg([part], Math.PI / 2);
                }
                if (!vertical && [1,3].includes(a)) {
                    this.rotateParts90Deg([part], Math.PI);
                }
            }*/
        }

        editor.addCurrentStateToStack();
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
     * @param  {array} parts              description
     * @param  {boolean} use_exact_center description
     * @return {object}                   See return below
     */
    getSelectionData (parts, use_exact_center) {
        /* Center is the calculated rotation center
         * largest_snap is the largest x and y grid size a part
         * in the selection has.
         *
         * w_range is the lowest and highest x values
         * h_range is the lowest and highest y values */
        let center = {x: 0, y: 0};
        let largest_snap = {x: 0, y: 0};
        let w_range = [gameUtil.large_number, -gameUtil.large_number];
        let h_range = [gameUtil.large_number, -gameUtil.large_number];

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
            let bounds = part.getBounds();

            if (bounds[0] < w_range[0]) w_range[0] = bounds[0];
            if (bounds[2] > w_range[1]) w_range[1] = bounds[2];
            if (bounds[1] < h_range[0]) h_range[0] = bounds[1];
            if (bounds[3] > h_range[1]) h_range[1] = bounds[3];

            if (part.data.data.min_snap_multiplier_x > largest_snap.x)
                largest_snap.x = part.data.data.min_snap_multiplier_x;
            if (part.data.data.min_snap_multiplier_y > largest_snap.y)
                largest_snap.y = part.data.data.min_snap_multiplier_y;
        });

        /* Center is average coordinates */
        center.x = Math.round(center.x / parts.length);
        center.y = Math.round(center.y / parts.length);

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
