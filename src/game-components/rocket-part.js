'use strict';

const PhysicalSprite = require('../components/physical-sprite.js');
const config = require('../game/config.js');

/**
 * A RocketPart
 */
class RocketPart extends PhysicalSprite {
    /**
     * constructor - RocketPart
     *
     * @param  {string} image_path Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     */
    constructor(image_path, width, height, x, y, data, id) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        let body = Matter.Bodies.rectangle(x, y, width, height);
        super(image_path, width, height, body);

        this.image_path = image_path;
        this.skip_add_body = true;

        /* Data that should be overrided by another
         * class that extends this class */
        this.id = id;

        /* Data provided */
        this.x = x;
        this.y = y;

        /* Data should be provided in this format
         * {
         *     mass: <number>,    Mass in kg
         *     drag: {            Drag multiplier for each face
         *        top: <number>,
         *        left: <number>,
         *        right: <number>,
         *        bottom: <number>
         *     },
         *     volume: <number>,  Volume in m^3
         *     density: <number>, Density in kg/m^3
         *     description: <string>,
         *     category: <string>,
         *
         *     Smallest part of a grid the part can "snap to"
         *     1 would mean the part snaps to the nearest grid,
         *     0.25 = nearest quarter grid, etc...
         *     Defaults to 1 for both x and y
         *
         *     min_snap_multiplier_x: <number>,
         *     min_snap_multiplier_y: <number>,
         *
         *     Can it overlap another object (size is taken into account, for example
         *     a half grid object can fit with another half grid object in the same grid
         *     cell even if this is false). DEFAULT: false
         *
         *     can_overlap: false
         * }
         */
        this.data = data;
        this.checkForMissingData();

        this.boundary_graphic = null;
    }

    /**
     * checkForMissingData - Checks if there is any
     * missing parameters in this.data and warns/replaces
     * with defaults as needed
     */
    checkForMissingData() {
        /* Data is missing (undefined or null) */
        for (let prop of ['mass', 'drag', 'volume', 'density', 'description', 'category']) {
            if (this.data[prop] === undefined || this.data[prop] === null) {
                throw {name : 'MissingDataException', message : prop + ' is missing in this.data for ' + this.id};
            }
        }
        if (!this.data.drag.top || !this.data.drag.left || !this.data.drag.right || !this.data.drag.bottom) {
            throw {
                name : 'MissingDataException',
                message : 'Drag is missing properties (top, left, right, bottom) in this.data for ' + this.id
            };
        }

        /* Fix defaults */
        if (!this.data.min_snap_multiplier_x) {
            this.data.min_snap_multiplier_x = 1;
        }
        if (!this.data.min_snap_multiplier_y) {
            this.data.min_snap_multiplier_y = 1;
        }
        if (this.data.can_overlap === undefined) {
            this.data.can_overlap = false;
        }
    }

    /**
     * update - Overriden update
     * @override
     */
    update() {
        super.update();

        // DEBUG
        if (this.boundary_graphic) {
            stage_handler.getStageByName('sim').stage.removeChild(this.boundary_graphic);
        }

        this.boundary_graphic = new PIXI.Graphics();
        let vert = this.body.vertices;

        for (let i=1;i<this.body.vertices.length;i++) {
            this.boundary_graphic.lineStyle(2, 0xff00ff)
               .moveTo(vert[i-1].x, vert[i-1].y)
               .lineTo(vert[i].x, vert[i].y);
        }

        stage_handler.getStageByName('sim').stage.addChild(this.boundary_graphic);

    }
}

module.exports = RocketPart;
