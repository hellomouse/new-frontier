/* index.js

 * Contains the stage for editor. Contains all the
 * higher level logic for editor
 *
 * You will find the following in this file:
 * - Selection handling
 * - Controls
 * - Undo/redo and copy-paste handling
 * - Construction of a rocket
 *
 * (c) Copyright by Hellomouse
 */

'use strict';

/* Data imports */
const gameUtil = require('../util.js');
const editorConfig = require('./config.js');
const controlState = require('../controls.js');
const editorMan = require('./manipulation.js');
const allParts = require('../game/rocket-parts/all-parts.js');
const displayCaption = require('../ui/caption.js');

/* Class imports */
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');
const Rocket = require('../game/rocket.js');
const RenderableScene = require('../ui/renderable-scene.js');
const Camera = require('../ui/camera.js');
const UndoRedo = require('undo-redo-js').UndoRedo;

/* HTML code for editor interface */
const editorHtml = require('./ui-html.js');


/* Functions for unpacking/packing parts into a JSON
 * like object. Used for state and saving */

/**
 * pack - Converts a RocketPartGraphic into a
 * condensed JSON representation
 *
 * @param  {RocketPartGraphic} obj Part to condense
 * @return {object}                Condensed JSON
 */
function pack (obj) {
    return {
        x: obj.x, y: obj.y,
        r: obj.sprite.rotation,
        i: obj.id, p: obj.properties
    };
}

/**
 * unpack - "unpacks" the JSON representation
 * of the object by converting it back into a
 * RocketPartGraphic and adding it back to the stage.
 *
 * @param  {object} obj              JSON Part representation
 * @param  {Editor} editor           Editor object
 * @param  {number} cx=0             Approximate center to add at (X)
 * @param  {number} cy=0             Approximate center to add at (Y)
 * @param  {boolean} select=false    Select the part after placing
 */
function unpack (obj, editor, cx=0, cy=0, select=false) {
    let part = new RocketPartGraphic(obj.i, obj.x + cx, obj.y + cy);

    part.sprite.rotation = obj.r;
    editor.currentBuild.push(part);
    editor.stage.addChild(part.sprite);

    if (select) editorMan.selectPartObject(editor, part, true);
}


/**
 * Editor, or the shipBuilder. Handles logic
 * to construct, save, load ships.
 */
class Editor extends RenderableScene {
    /**
     * constructor - Construct an Editor
     * Takes no arguments
     */
    constructor() {
        super();

        /* Scene and camera */
        this.scene = null;                    /* Created in init */
        this.camera = new Camera(0.28, 4, 1);  /* Min zoom = 0.28, max zoom = 4, initial zoom = 1 */

        this.cameraFocus = { x: 0, y: 0 };    /* Coordinates to focus camera on */
        this.cameraFocusBeforeDrag = { x: 0, y: 0 };  /* Camera focus before camera is dragged */

        /* Actions/build */
        this.currentSelectBuild = null;     /* <string> current id of selected part */
        this.swipe = false;     /* If true drag is rectangle select, else camera move */
        this.stack = new UndoRedo({ limit: editorConfig.buildMaxUndo }); /* Saves undo/redo states */

        /* <number 0-4> rotation, in 90 deg increments to place the currently selected
         * part. For example, if this was 2, all parts would be placed with an initial
         * 180 DEG rotation (2 * 90 = 180) */
        this.placement_rotation = 0;

        /* Build data */
        this.currentBuild = [];   /* Array of RocketPartGraphic */
        this.selectedParts = [];  /* Array of RocketPartGraphics with reference in currentBuild */
        this.clipboard = [];      /* Array of objects that can be converted to RocketPartgraphic */

        /* Width of left side of editor (selectors)
         * MUST MATCH SUM OF THE 2 LEFT DIVS in UI-html */
        this.leftPartWidth = 280;

        /* Select rectangle graphic */
        this.selectRectangleGraphic = null;
    }

    /**
     * init - Init the editor.
     * @override
     */
    init () {
        super.init();
        this.html = editorHtml;  /* Load the UI */

        /* Draw a build grid */
        let lines = new PIXI.Graphics();
        let bound = editorConfig.buildAreaBoundary;
        let thickness;

        lines.alpha = 0.1;
        this.stage.addChild(lines);

        for (let i = -bound; i <= bound; i += editorConfig.buildGridSize) {
            /* Adjust for a thicker outer boundary */
            thickness = editorConfig.gridThickness * (Math.abs(i) === bound ? editorConfig.edgeGridMultiplier : 1);

            lines.lineStyle(thickness, editorConfig.gridLineColor);
            lines.moveTo(i, -bound).lineTo(i, bound);
            lines.moveTo(-bound, i).lineTo(bound, i);
        }
    }

    /**
     * update - Update the editor
     * Runs once per frame, updates scene and camera
     * @override
     */
    update () {
        this.camera.focusOn(this.cameraFocus);
        this.camera.updateScene(this.stage, this.renderer);
        this.stage.pivot.x -= this.leftPartWidth;  /* Adjust for extra space on left */
    }

    /**
     * addCurrentStateToStack - Adds the current build
     * to the undo/redo stack. Run this when you update
     * something in the build.
     */
    addCurrentStateToStack () {
        let state = this.currentBuild.map(pack);
        this.stack.add(state);
    }

    /**
     * restoreState - Restores a state from an
     * undo or redo (this.state.undo() or this.state.redo())
     *
     * @param  {array} state State from this.state
     */
    restoreState (state) {
        editorMan.deleteAll(this, false);
        state.forEach(p => unpack(p, this));
        this.currentSelectBuild = null;
    }

    /**
     * processMouseCoordinates - Given a click
     * event, processes the coordinates to the current canvas.
     * (Returns local world coordinates)
     *
     * @param  {MouseEvent} e Mouse event
     * @return {array}        [x, y] processed
     */
    processMouseCoordinates (e) {
        let x = e.clientX;
        let y = e.clientY;

        /* X coordinate is on the left side of the screen
         * (User is selecting parts and not placing down parts)
         * If user clisk this, unselect current selections */
        if (x < this.leftPartWidth) {  /* See editor-html.js, add the width of the 2 left divs */
            editorMan.unselectCurrentBuild(this);
            editorMan.unselectAll(this);
            return;
        }

        /* Transform x and y coordinates to stage coordinates */
        let pos = this.stage.toLocal(new PIXI.Point(x, y));
        return [pos.x, pos.y];
    }

    /**
     * updatedSelectedIcon - Update the current
     * little mouse icon that displays the part
     * that is selected
     *
     * @param  {Event} e  Event
     */
    updatedSelectedIcon (e) {
        if (!e) return;  /* No event, mouse possible off screen */
        let icon = document.getElementById('follow-mouse-editor-icon');

        /* Reset the html div if nothing is selected */
        if (!this.currentSelectBuild) {
            icon.style.display = 'none';
            icon.style.transform = 'rotate(0deg)';
            this.placement_rotation = 0;
            return;
        }

        /* Keep image at mouse location */
        let x = e.clientX;
        let y = e.clientY;
        let data = allParts.indexData[this.currentSelectBuild];

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        icon.src = data.image_path;
        icon.style.display = 'inline';

        /* Scale image for camera scale */
        icon.style.width = data.width * this.camera.scale + 'px';
        icon.style.height = data.height * this.camera.scale + 'px';

    }

    /**
     * handleSelectionRectangle - Draws the selection rectangle
     *
     * @param  {Event} e                Event
     * @param  {PIXI.Point} coords      Coord of mouse (to local stage)
     * @param  {PIXI.Point} initial_pos Coord of last mouse down (to local stage)
     */
    drawSelectionRectangle (e, coords, initial_pos) {
        /* Get rectangle size */
        let w = initial_pos.x - coords.x;
        let h = initial_pos.y - coords.y;

        if (this.selectRectangleGraphic)  /* Remove existing graphics */
            this.stage.removeChild(this.selectRectangleGraphic);

        /* Draw the rectangle */
        this.selectRectangleGraphic = new PIXI.Graphics();
        this.selectRectangleGraphic.beginFill(editorConfig.selectRectangleColor);
        this.selectRectangleGraphic.lineStyle(1, editorConfig.selectRectangleColor);
        this.selectRectangleGraphic.drawRect(initial_pos.x, initial_pos.y, -w, -h)
        this.selectRectangleGraphic.alpha = 0.3;

        this.stage.addChild(this.selectRectangleGraphic);
    }

    /**
     * removeRectangleGraphic - Removes select rect graphic
     * from the stage and sets variable to null
     */
    removeRectangleGraphic () {
        this.stage.removeChild(this.selectRectangleGraphic);
        this.selectRectangleGraphic = null;
    }

    /**
     * constructRocket - Construct a new Rocket object
     * that can be added to the sim
     *
     * @return {Rocket}  Rocket built in the editor
     */
    constructRocket () {
        /* Array of RocketPart objects */
        let parts = this.currentBuild.map(part => {
            /* Convert each rocketPartGraphic to a rocket */
            let returned = new allParts.index[part.id](part.x, part.y);
            returned.setSpriteRotation(part.sprite.rotation);

            return returned;
        });

        /* Clean memory by removing any RocketPartGraphics that exist */
        this.currentBuild = [];
        this.selectedParts = [];
        this.clipboard = [];
        this.stack = new UndoRedo({ limit: editorConfig.buildMaxUndo });

        /* Construct and return the actual object */
        let rocket = new Rocket(parts);

        rocket.reposition(90, -100); // TODO update to launch pad coords
        return rocket;
    }

    /**
     * onLeftClick - On click event. Places
     * ship parts and other events that
     * need to be handled with the mouse click.
     *
     * @param  {MouseEvent} e Mouse event
     * @override
     */
    onLeftClick (e) {
        /* Get mouse coordinates */
        let coords = this.processMouseCoordinates(e);
        if (!coords) return;

        /* Mouse drag detected. Depending on swipe,
         * select a bounding box or move the camera */
        if (controlState.mouse.dragging) {
            /* Initial position of mousedown */
            let initial_pos = this.stage.toLocal(
                new PIXI.Point(controlState.mouse.last_mousedown[0], controlState.mouse.last_mousedown[1]));

            /* Select a bounding box */
            if (this.swipe) {
                /* If CTRL isn't held down reset the selection */
                if (!controlState.keyboard.Control)
                    editorMan.unselectAll(this);

                /* Remove the rectangle graphic now that the drag is complete */
                this.removeRectangleGraphic();
                editorMan.selectPartsBoundingBox(this,initial_pos.x, initial_pos.y, coords[0], coords[1]);
            } else {
                /* Set initial camera before drag coordinates */
                this.cameraFocusBeforeDrag.x = this.cameraFocus.x;
                this.cameraFocusBeforeDrag.y = this.cameraFocus.y;
            }
            return;
        }

        /* Failed to place part, try selecting a part
         * Start by finding a part at location */
        if (!editorMan.addPart(this, coords[0], coords[1]) && !this.currentSelectBuild)
            editorMan.selectPart(this, coords[0], coords[1]);

        /* Success placing part!
         * Deselect everything */
        else editorMan.unselectAll(this);
    }

    /**
     * onRightClick - Open the special menu
     * for ship parts (If they have one)
     *
     * @param  {MouseEvent} e Mouse event
     * @override
     */
    onRightClick (e) {
        /* Right mouse click
         * Options for part at <x, y> */
        this.currentSelectBuild = null;
        this.updatedSelectedIcon(e);

        let coords = this.processMouseCoordinates(e);
        if (!coords) return;

        // TODO implement the special menu
    }

    /**
     * onKeyDown - Runs on the keydown event
     * @param  {Event} e      Event
     * @param  {string} name  Key name
     * @override
     */
    onKeyDown (e, name) {
        switch (name) {
            /* Delete selection */
            case 'Backspace':
            case 'Delete': {
                editorMan.deleteSelection(this);
                break;
            }

            /* Rotate selection left and right respectively */
            case 'q':
            case 'e': {
                editorMan.rotateSelection(this, (name === 'e' ? 1 : -1) * Math.PI / 2, true);

                /* Rotate the icon of selection */
                if (this.currentSelectBuild) {
                    this.placement_rotation += (name === 'e' ? 1 : -1);
                    document.getElementById('follow-mouse-editor-icon').style.transform =
                        `rotate(${Math.round(this.placement_rotation * 90)}deg)`;
                }
                break;
            }

            /* Move selection left, up, down or right
             * Ctrl-A is select all */
            case 'a': case 'ArrowLeft':
            case 's': case 'ArrowDown':
            case 'w': case 'ArrowUp':
            case 'd': case 'ArrowRight': {
                if (controlState.keyboard.Control && name === 'a') {
                    for (let part of this.currentBuild)
                        part.select();
                    this.selectedParts = this.currentBuild;
                    break;
                }

                let dpos = gameUtil.controls.WASDToDxDy(
                    Math.max.apply(null, this.selectedParts.map(p => p.getSnapX())) * editorConfig.buildGridSize,
                    Math.max.apply(null, this.selectedParts.map(p => p.getSnapY())) * editorConfig.buildGridSize,
                    name);

                for (let part of this.selectedParts)
                    part.moveToRelative(dpos.dx, dpos.dy);

                editorMan.snapOutOfBounds(this);
                this.addCurrentStateToStack();
                break;
            }

            /* Undo & Redo */
            case 'z':
            case 'y': {
                if (controlState.keyboard.Control) {
                    let state = name === 'z' ? this.stack.undo() : this.stack.redo();
                    if (state) this.restoreState(state);
                }
                break;
            }

            /* Toggle swipe */
            case 't': {
                this.swipe = !this.swipe;
                displayCaption('Swipe ' + (this.swipe ? 'enabled' : 'disabled'));
                break;
            }

            /* Mirror (f = vertical, g = horiziontal) */
            case 'f':
            case 'g': {
                if (controlState.keyboard.Control) editorMan.mirrorSelection(this, name === 'f');
                break;
            }
        }
    }

    /**
     * onMousemove - Runs on mousemove
     * @param  {Event} e      Event
     * @override
     */
    onMousemove (e) {
        if (!e) return;               // Outside of screen
        this.updatedSelectedIcon(e);  // Updated selected icon

        /* Revert mouse pointer */
        document.getElementById('ui-overlay').style.cursor = 'initial';

        /* Draw the select rectangle that shows the selection */
        if (!controlState.mouse.isdown) {
            this.removeRectangleGraphic();
            return;
        }

        let coords = this.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
        let lmdown = controlState.mouse.last_mousedown;
        let initial_pos = this.stage.toLocal(new PIXI.Point(lmdown[0], lmdown[1]));

        /* Draw the selection rectangle */
        if (this.swipe) this.drawSelectionRectangle(e, coords, initial_pos);
        else {
            /* Drag the camera */
            this.cameraFocus.x = this.cameraFocusBeforeDrag.x + initial_pos.x - coords.x;
            this.cameraFocus.y = this.cameraFocusBeforeDrag.y + initial_pos.y - coords.y;

            /* Camera boundary. Y boundary is stricter */
            if (Math.abs(this.cameraFocus.x) > editorConfig.buildAreaBoundary / 2)
                this.cameraFocus.x = gameUtil.math.copySign(this.cameraFocus.x) * editorConfig.buildAreaBoundary / 2;
            if (Math.abs(this.cameraFocus.y) > editorConfig.buildAreaBoundary / 4)
                this.cameraFocus.y = gameUtil.math.copySign(this.cameraFocus.y) * editorConfig.buildAreaBoundary / 4;

            /* Set move mouse pointer */
            document.getElementById('ui-overlay').style.cursor = 'move';
        }
    }

    /**
     * onScroll - On scroll event
     * Update the selection icon zoom
     *
     * @param  {Event} e  Event
     * @override
     */
    onScroll (e) {  this.updatedSelectedIcon(e); }

    /**
     * onCopy - Copy current selection
     * @override
     */
    onCopy () { this.clipboard = this.selectedParts.map(pack); }

    /**
     * onCut - Cut current selection
     * @override
     */
    onCut () {
        this.onCopy();
        editorMan.deleteSelection(this);
    }

    /**
     * onPaste - Paste selection
     * @override
     */
    onPaste () {
        editorMan.unselectAll(this);

        /* Paste near the current camera focus */
        let cx = this.cameraFocus.x;
        let cy = this.cameraFocus.y;
        let rc = editorMan.snapCoordToGrid(cx, cy, 1, 1);

        this.clipboard.forEach(p => unpack(p, this, rc.x, rc.y, true));
        this.addCurrentStateToStack();
    }
}


module.exports = Editor;
