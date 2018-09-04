/* manipulation.js
 * Manipulation of parts in the editor, such as adding,
 * removing, transforming parts
 *
 * All functions take in the editor object
 * as the first parameter and mutate the editor directly
 * unless otherwise specified in the docs */

'use strict';

/* Data imports */
const gameUtil = require('../util.js');
const editorConfig = require('./config.js');
const controlState = require('../controls.js');

/* Class imports */
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');

/** Functions to manipulate rocket parts  */
module.exports = {
    /**
     * unselectAll - Unselects all currently
     * selected parts.
     *
     * @param {Editor} editor  Level editor
     */
    unselectAll (editor) {
        for (let part of editor.selectedParts)
            part.unselect();
        editor.selectedParts = [];
    },

    /**
     * unselectCurrentBuild - Unselects the current
     * part selected to place (Aka the icon that moves
     * with the mouse)
     *
     * @param {Editor} editor  Level editor
     */
    unselectCurrentBuild (editor) {
        editor.currentSelectBuild = null;
        editor.updatedSelectedIcon(controlState.mouse.pos_event);
    },

    /**
     * selectPart - Select a part at
     * given coordinates
     *
     * @param  {Editor} editor Level editor
     * @param  {number} x      X pos
     * @param  {number} y      Y pos
     */
    selectPart (editor, x, y) {
        let part = this.getPartAt(editor, x, y, true);

        if (part) {
            /* If CTRL is held down add part to selection */
            if (!controlState.keyboard.Control) this.unselectAll(editor);

            editor.selectedParts.push(part);
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
     * @param  {RocketPartGraphic} obj    Obj to select
     * @param  {boolean} ignoreCtrl=false Ignore the ctrl check
     */
    selectPartObject (editor, obj, ignoreCtrl=false) {
        /* If CTRL is held down add part to selection */
        if (!controlState.keyboard.Control && !ignoreCtrl) this.unselectAll(editor);

        editor.selectedParts.push(obj);
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
        /* Sort the boundaries of the selection */
        let x_bounds = [x1, x2].sort((a, b) => a - b);
        let y_bounds = [y1, y2].sort((a, b) => a - b);

        for (let part of editor.currentBuild) {
            /* Select any parts that match the selection */
            if (gameUtil.math.rectIntersect(
                    x_bounds[0], y_bounds[0], x_bounds[1], y_bounds[1],
                    part.x - part.getRealWidth() / 2, part.y - part.getRealHeight() / 2,
                    part.x + part.getRealWidth() / 2, part.y + part.getRealHeight() / 2)) {
                editor.selectedParts.push(part);
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
        for (let part of editor.selectedParts) {
            /* Delete parts from stage, graphics array and part array */
            editor.stage.removeChild(part.sprite);
            delete editor.currentBuild[editor.currentBuild.indexOf(part)];
        }

        editor.selectedParts = [];
        editor.currentBuild = editor.currentBuild.filter(x => x !== undefined);
        editor.addCurrentStateToStack();
    },

    /**
     * deleteAll - Deletes all objects currently
     * in the editor.
     *
     * @param {Editor} editor       Level editor
     * @param {boolean} undo=true   Save as undo action?
     */
    deleteAll(editor, undo=true) {
        for (let part of editor.currentBuild) {
            /* Delete parts from stage, graphics array and part array */
            editor.stage.removeChild(part.sprite);
            delete editor.currentBuild[editor.currentBuild.indexOf(part)];
        }

        editor.currentBuild = [];
        editor.selectedParts = [];
        if (undo) editor.addCurrentStateToStack();
    },

    /**
     * addPart - Add the currently selected part
     * at given position.
     *
     * @param  {Editor} editor     Level editor
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {boolean} force     Force placement?
     * @param  {boolean} undo=true Save as undo action?
     * @return {boolean}           Did it place
     */
    addPart (editor, x, y, force=false, undo=true) {
        if (!editor.currentSelectBuild) return false;  // Nothing selected

        /* Create the object and other variables */
        let angle = gameUtil.math.normalizeAngle(Math.PI / 2 * editor.placement_rotation);
        let obj = new RocketPartGraphic(editor.currentSelectBuild, x, y);
        let [mx, my] = [obj.getSnapX(), obj.getSnapY()];

        /* Snap to smallest grid size */
        ({ x, y } = this.snapCoordToGrid(x , y, mx, my));

        /* Rotate and move object to correct location */
        obj.sprite.rotation = angle;
        obj.moveTo(x + obj.getRealWidth() / 2, y + obj.getRealHeight() / 2);

        /* Can the part be allowed to overlap at that point? */
        if (!obj.data.can_overlap && !force) {
            for (let part of editor.currentBuild) {
                /* The + 1 and - 1 are to allow objects to touch the edge, otherwise
                 * adjacent grids cannot have objects */
                if (gameUtil.math.rectIntersect(
                        obj.x - obj.getRealWidth() / 2 + 1, obj.y - obj.getRealHeight() / 2 + 1,
                        obj.x + obj.getRealWidth() / 2 - 1, obj.y + obj.getRealHeight() / 2 - 1,
                        part.x - part.getRealWidth() / 2, part.y - part.getRealHeight() / 2,
                        part.x + part.getRealWidth() / 2, part.y + part.getRealHeight() / 2))
                    return false;
            }
        }

        editor.currentBuild.push(obj);
        editor.stage.addChild(obj.sprite);

        if (undo) editor.addCurrentStateToStack();
        return true;
    },

    /**
     * getPartAt - Obtain the current rocket
     * part at coordinates.
     *
     * @param  {Editor} editor             Level editor
     * @param  {number} x                  X pos
     * @param  {number} y                  Y pos
     * @param  {boolean} notselected=false Only select unselected parts?
     * @return {RocketPartGraphic}         Part
     */
    getPartAt (editor, x, y, notselected=false) {
        for (let part of editor.currentBuild) {
            if (notselected && part.selected) continue;

            /* Occupies identical location */
            if (x === part.x && y === part.y) return part;

            /* Intersection between another part */
            if (part.containsPoint(x, y)) return part;
        }
        return null;
    },

    /**
     * rotateSelection - Rotate the current selection
     * by an angle (Angle MUST BE MULTIPLE of 90 degrees)
     *
     * @param  {Editor} editor Editor object
     * @param  {number} angle  Angle in radians
     */
    rotateSelection (editor, angle) {
        /* No parts to rotate */
        if (editor.selectedParts.length === 0) return;

        this.rotateParts(editor.selectedParts, angle);
        editor.addCurrentStateToStack();
    },

    /**
     * rotateParts - Rotate an array of
     * RocketPartGraphic by an angle (Angle MUST BE MULTIPLE of 90 degrees)
     *
     * @param  {array} parts   Array of RocketPartGraphic
     * @param  {number} angle  Angle in radians
     */
    rotateParts (parts, angle) {
        /* Normalize the angle between 0 and 2 PI */
        angle = gameUtil.math.normalizeAngle(angle);

        /* Because the code below only rotates PI / 2,
         * rotating multiple times is needed to rotate
         * by another multiple of 90 DEG */
        while (angle > Math.PI / 2) {
            angle -= Math.PI / 2;
            this.rotateParts(parts, Math.PI / 2);
        }

        let { center, largest_snap } = this.getSelectionData(parts);
        let largest_width = { width: 0 };
        let largest_height = { height: 0 };
        let px, py, x, y;

        /* Rotate each part around the center,
         * then rotate the part itself */

        /* First, 'pretend' to rotate the selection to
         * determine the part with the greatest width and height,
         * and the location of that part when rotated */
        for (let part of parts) {
            [px, py] = [part.x, part.y];
            x = -(py - center.y) + center.x;
            y = ( px - center.x) + center.y;

            part.sprite.rotation += angle;
            part.sprite.rotation = gameUtil.math.normalizeAngle(part.sprite.rotation);

            if (part.getRealWidth() > largest_width.width)
                largest_width = { width: part.getRealWidth(), x: x };
            if (part.getRealHeight() > largest_height.height)
                largest_height = { height: part.getRealHeight(), y: y };

            part.sprite.rotation -= angle;
        }

        let snap = this.snapCoordToGrid(largest_width.x + largest_width.width / 2,
            largest_height.y + largest_height.height / 2, largest_snap.x, largest_snap.y, true);
        let dx = snap.x - (largest_width.x + largest_width.width / 2);
        let dy = snap.y - (largest_height.y + largest_height.height / 2);

        /* Rotate the part for real now, and translate each part by the
         * difference between the snap of the largest part and the part */
        for (let part of parts) {
            [px, py] = [part.x, part.y];
            x = -(py - center.y) + center.x;
            y =  (px - center.x) + center.y;

            part.moveTo(x + dx, y + dy);
            part.sprite.rotation += angle;
        }
    },

    /**
     * mirrorSelection - Mirror the current selection
     *
     * @param  {Editor}  editor         Editor object
     * @param  {boolean} vertical=true  If true mirrors vertically (across x-axis-line)
     */
    mirrorSelection (editor, vertical=true) {
        /* No parts to mirror */
        if (editor.selectedParts.length === 0) return;

        let { center, largest_snap } = this.getSelectionData(editor.selectedParts);
        let largest_width = { width: 0 };
        let largest_height = { height: 0 };

        /* Calculate mirrored location (But don't actually mirror yet)
         * to determine the largest width and height + location for snapping */
        for (let part of editor.selectedParts) {
            let [px, py] = [part.x, part.y];

            /* Determine new coordinate */
            if (vertical) py = center.y - py + center.y;
            else          px = center.x - px + center.x;

            if (part.getRealWidth() > largest_width.width)
                largest_width = { width: part.getRealWidth(), x: px };
            if (part.getRealHeight() > largest_height.height)
                largest_height = { height: part.getRealHeight(), y: py };
        }

        /* Determine translation for grid snapping */
        let snap = this.snapCoordToGrid(largest_width.x + largest_width.width / 2,
            largest_height.y + largest_height.height / 2, largest_snap.x, largest_snap.y, true);
        let dx = snap.x - (largest_width.x + largest_width.width / 2);
        let dy = snap.y - (largest_height.y + largest_height.height / 2);

        /* Mirror and snap all parts */
        for (let part of editor.selectedParts) {
            let [px, py] = [part.x, part.y];

            if (vertical) py = center.y - py + center.y;
            else          px = center.x - px + center.x;

            part.moveTo(px + dx, py + dy);
        }

        editor.addCurrentStateToStack();
    },

    /**
     * getSelectionData - Get selection data for an
     * array of placed parts
     *
     * @param  {array} parts    Array of RocketPartGraphic
     * @return {object}         See return below
     */
    getSelectionData (parts) {
        /* Center is the calculated rotation center
         * largest_snap is the largest x and y grid size a part
         * in the selection has.
         *
         * w_range is the lowest and highest x values
         * h_range is the lowest and highest y values */
        let center = { x: 0, y: 0 };
        let largest_snap = { x: 0, y: 0 };
        let w_range = [gameUtil.large_number, -gameUtil.large_number];
        let h_range = [gameUtil.large_number, -gameUtil.large_number];

        parts.forEach(part => {
            center.x += part.x;
            center.y += part.y;

            /* Obtain the max, min values for above variables */
            let bounds = part.getBounds();

            if (bounds[0] < w_range[0]) w_range[0] = bounds[0];
            if (bounds[2] > w_range[1]) w_range[1] = bounds[2];
            if (bounds[1] < h_range[0]) h_range[0] = bounds[1];
            if (bounds[3] > h_range[1]) h_range[1] = bounds[3];

            if (part.getSnapX() > largest_snap.x)
                largest_snap.x = part.getSnapX();
            if (part.getSnapY() > largest_snap.y)
                largest_snap.y = part.getSnapY();
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
        let smallest_x = snap_x * editorConfig.buildGridSize;
        let smallest_y = snap_y * editorConfig.buildGridSize;
        let f = round ? Math.round : Math.floor;

        x = f(x / smallest_x) * smallest_x;
        y = f(y / smallest_y) * smallest_y;
        return { x: x, y: y };
    }
};
