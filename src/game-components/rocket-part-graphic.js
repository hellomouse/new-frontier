'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');
const gameUtil = require('../util.js');

/**
 * A graphic for a rocket part used in the
 * rocket editor. Graphical only.
 */
class RocketPartGraphic {
    /**
     * constructor - Construct a RocketPartGraphic
     *
     * @param  {string} id ID of part
     * @param  {number} x  x to spawn
     * @param  {number} y  y to spawn
     */
    constructor(id, x, y) {
        /* Load data from rocket part */
        this.id = id;
        this.data = allParts.index_data[id];

        /* Sprite data */
        this.sprite = PIXI.Sprite.from(this.data.image_path);
        this.sprite.width = this.data.width;
        this.sprite.height = this.data.height;
        this.sprite.x = x;
        this.sprite.y = y;

        /* Alias for sprite.x */
        this.x = x;
        this.y = y;

        /* Other variables */
        this.selected = false;
        this.validLocation = true;
    }


    /**
     * containsPoint - Proper check if
     * a point is within its sprite.
     *
     * @param  {number} x X
     * @param  {number} y Y
     * @return {boolean}  Is point in sprite
     */
    containsPoint(x, y) {
        let bounds = this.getBounds();
        return gameUtil.math.isBetween(x, bounds[0], bounds[2]) &&
               gameUtil.math.isBetween(y, bounds[1], bounds[3]);
    }

    /**
     * getBounds - Return bounds.
     * @return {array}  [x1, y1, x2, y2]
     */
    getBounds() {
        let rotation = Math.floor(this.sprite.rotation / (Math.PI / 2));
        let bounds;

        if (rotation === 0 || rotation === 4) bounds = [this.x, this.y, this.x + this.sprite.width, this.y + this.sprite.height];
        else if (rotation === 2) bounds = [this.x, this.y, this.x - this.sprite.width, this.y - this.sprite.height];
        else if (rotation === 1) bounds = [this.x, this.y, this.x - this.sprite.height, this.y + this.sprite.width];
        else if (rotation === 3) bounds = [this.x, this.y, this.x + this.sprite.height, this.y - this.sprite.width];

        let t;
        if (bounds[0] > bounds[2]) {
            t = bounds[0];
            bounds[0] = bounds[2];
            bounds[2] = t;
        }
        if (bounds[1] > bounds[3]) {
            t = bounds[1];
            bounds[1] = bounds[3];
            bounds[3] = t;
        }

        return bounds;
    }


    /**
     * select - Display the part as selected
     */
    select() {
        this.sprite.tint = 0x00FF00;
        this.selected = true;
    }

    /**
     * unselect - Display part as unselected
     */
    unselect() {
        this.sprite.tint = 0xFFFFFF;
        this.selected = false;
    }

    /**
     * moveTo - Moves to new location
     *
     * @param  {number} x X pos
     * @param  {number} y Y pos
     */
    moveTo(x, y) {
        [x, y] = [Math.floor(x), Math.floor(y)]; // Fix rounding errors

        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }

    /**
     * moveTo - Moves to new relative
     * location (dx and dy)
     *
     * @param  {number} dx X pos cahnge
     * @param  {number} dy Y pos change
     */
    moveToRelative(dx, dy) {
        this.moveTo(this.x + dx, this.y + dy);
    }
}

module.exports = RocketPartGraphic;
