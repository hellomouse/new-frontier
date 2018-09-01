'use strict';

const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');
const config = require('../game/config.js');
const Camera = require('../ui/camera.js');
const controlState = require('../controls.js');

const allParts = require('../game/rocket-parts/all-parts.js');
const RocketPartGraphic = require('../game-components/rocket-part-graphic.js');
const Rocket = require('../game/rocket.js');

const EditorHtml = require('./Editor-html.js');

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
        this.currentSelectBuild = null;
        this.currentAction = 'place'; // place, rotate, or move
        this.cameraFocus = { x: 0, y: 0 };

        this.currentBuild = [];
        this.selectedParts = [];

        /* Width of left side of Editor (selectors)
         * Since HTML is not yet loaded will be loaded on click */
        this.leftPartWidth = null;
        this.topPartHeight = null;

        /* Select rectangle graphic */
        this.selectRectangleGraphic = null;
    }

    /**
     * init - Init the Editor.
     * @override
     */
    init() {
        super.init();
        this.html = EditorHtml; // Create buttons

        let lines = new PIXI.Graphics();
        this.stage.addChild(lines);

        /* DEBUG */
        for (let x = -config.buildGridSize * 20; x < 1000; x += config.buildGridSize) {
            lines.lineStyle(1, 0xffffff)
                   .moveTo(x, -1000)
                   .lineTo(x, 1000);
        }
        for (let y = -config.buildGridSize * 20; y < 1000; y += config.buildGridSize) {
            lines.lineStyle(1, 0xffffff)
                   .moveTo(-1000, y)
                   .lineTo(1000, y);
        }
    }

    /**
     * update - Update the Editor (Per Frame)
     * @override
     */
    update() {
        this.camera.focusOn(this.cameraFocus);
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
        if (!this.leftPartWidth) {
            this.leftPartWidth = +document.getElementById('editor-left-1').style.width.replace('px', '') +
            +document.getElementById('parts').style.width.replace('px', '');
        }
        if (!this.topPartHeight) {
            this.topPartHeight = +document.getElementById('editor-top').style.height.replace('px', '');
        }

        /* X coordinate is on the left side of the screen
         * (User is selecting parts and not placing down parts)
         * Or Y coordinate is top 50 px */
        if (x < this.leftPartWidth || y < this.topPartHeight) { // See Editor-html.js, add the width of the 2 divs
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
        if (controlState.mouse.dragging) {
            let initialPos = this.stage.toLocal(
                new PIXI.Point(
                    controlState.mouse.lastMousedown[0],
                    controlState.mouse.lastMousedown[1]
                ));

            if (!controlState.keyboard.Control) this.unselectAll();

            /* Remove the rectangle graphic */
            this.removeRectangleGraphic();
            this.selectPartsBoundingBox(initialPos.x, initialPos.y, x, y);
            return;
        }

        /* Failed to place part, try selecting part
         * Start by finding a part at location */
        if (!this.addPart(x, y) && !this.currentSelectBuild) this.selectPart(x, y);

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
        this.updatedSelectedIcon(e); // Updated selected icon

        /* Draw the select rectangle that shows the selection */
        if (!controlState.mouse.isdown) {
            this.removeRectangleGraphic();
            return;
        }

        let lmdown = controlState.mouse.lastMousedown;
        let coords = this.stage.toLocal(new PIXI.Point(e.clientX, e.clientY));
        let initialPos = this.stage.toLocal(new PIXI.Point(lmdown[0], lmdown[1]));

        let w = initialPos.x - coords.x;
        let h = initialPos.y - coords.y;

        /* Actual drawing */
        if (this.selectRectangleGraphic) stageHandler.getStageByName('editor').stage.removeChild(this.selectRectangleGraphic);
        this.selectRectangleGraphic = new PIXI.Graphics();

        this.selectRectangleGraphic.beginFill(0x00FF00);
        this.selectRectangleGraphic.lineStyle(1, 0x00FF00);
        this.selectRectangleGraphic.drawRect(initialPos.x, initialPos.y, -w, -h);
        this.selectRectangleGraphic.alpha = 0.3;

        stageHandler.getStageByName('editor').stage.addChild(this.selectRectangleGraphic);
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

        if (!this.currentSelectBuild) {
            icon.style.display = 'none';
            return;
        }

        let x = e.clientX;
        let y = e.clientY;
        let data = allParts.indexData[this.currentSelectBuild];

        icon.style.left = x + 'px';
        icon.style.top = y + 'px';
        icon.src = data.imagePath;

        icon.style.width = data.width * this.camera.scale + 'px';
        icon.style.height = data.height * this.camera.scale + 'px';
        icon.style.display = 'inline';
    }

    /**
     * unselectAll - Unselects all currently
     * selected parts.
     */
    unselectAll() {
        for (let part of this.selectedParts) {
            part.unselect();
        }
        this.selectedParts = [];
    }

    /**
     * unselectCurrentBuild - Unselects the current
     * part selected to place
     */
    unselectCurrentBuild() {
        this.currentSelectBuild = null;
        this.updatedSelectedIcon(controlState.mouse.pos_event);
    }

    /**
     * removeRectangleGraphic - Removes select rect graphic
     */
    removeRectangleGraphic() {
        stageHandler.getStageByName('editor').stage.removeChild(this.selectRectangleGraphic);
        this.selectRectangleGraphic = null;
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
            if (!controlState.keyboard.Control) this.unselectAll();

            this.selectedParts.push(part);
            part.select();
        } else {/* Clicking on empty space = deselect */
            this.unselectAll();
        }
    }

    /**
     * selectPartsBoundingBox - Select all parts in a bounding box
     *
     * @param  {number} x1  Corner 1 X pos
     * @param  {number} y1  Corner 1 Y pos
     * @param  {number} x2  Corner 2 X pos
     * @param  {number} y2  Corner 2 Y pos
     */
    selectPartsBoundingBox(x1, y1, x2, y2) {
        let xBounds = [x1, x2].sort((a, b) => a - b);
        let yBounds = [y1, y2].sort((a, b) => a - b);

        for (let part of this.currentBuild) {
            if (gameUtil.math.rectIntersect(xBounds[0], yBounds[0], xBounds[1], yBounds[1],
                    part.x, part.y, part.x + part.data.width, part.y + part.data.height)) {
                this.selectedParts.push(part);
                part.select();
            }
        }
    }

    /**
     * deleteSelection - Deletes current
     * selection of parts
     */
    deleteSelection() {
        for (let part of this.selectedParts) {
            /* Delete parts from stage, graphics array and part array */
            this.stage.removeChild(part.sprite);
            delete this.currentBuild[this.currentBuild.indexOf(part)];
            // this.currentBuild = this.currentBuild.filter(p => p.x !== part.x || p.y !== p.y || p.name !== part.id);
        }

        this.selectedParts = [];
        this.currentBuild = this.currentBuild.filter(x => x !== undefined);
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
        if (!this.currentSelectBuild) return false; // Nothing selected

        let partData = allParts.indexData[this.currentSelectBuild];

        // Snap to smallest grid size
        let smallestX = partData.data.min_snap_multiplier_x * config.buildGridSize;
        let smallestY = partData.data.min_snap_multiplier_y * config.buildGridSize;

        x = Math.floor(x / smallestX) * smallestX;
        y = Math.floor(y / smallestY) * smallestY;

        // Can the part be allowed to overlap at that point?
        if (!partData.data.can_overlap) {
            for (let part of this.currentBuild) {
                /* Occupies identical location */
                if (x === part.x && y === part.y) return false;

                /* Intersection between another part */
                if (x < part.x + part.data.width &&
                    part.x < x + partData.width &&
                    y < part.y + part.data.height &&
                    part.y < y + partData.height) return false;
            }
        }

        let obj = new RocketPartGraphic(this.currentSelectBuild, x, y);

        this.currentBuild.push(obj);
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
     * @return {rocketPartGraphic}   Part
     */
    getPartAt(x, y) {
        for (let part of this.currentBuild) {
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
     * constructrocket - Construct a new rocket object
     * that can be added to the sim
     *
     * @return {rocket}  rocket built in the Editor
     */
    constructrocket() {
        let parts = this.currentBuild.map(part => {
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
