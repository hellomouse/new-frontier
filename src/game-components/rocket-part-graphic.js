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
        this.sprite.anchor.set(0.5, 0.5);

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
        return gameUtil.math.isBetween(x, this.x - this.getRealWidth() / 2, this.x + this.getRealWidth() / 2) &&
               gameUtil.math.isBetween(y, this.y - this.getRealHeight() / 2, this.y + this.getRealHeight() / 2);
    }

    /**
     * getBounds - Return bounds.
     * @return {array}  [x1, y1, x2, y2]
     */
    getBounds() {
        return [this.x - this.getRealWidth() / 2, this.x + this.getRealWidth() / 2, this.y - this.getRealHeight() / 2, this.y + this.getRealHeight() / 2]
    }

    /**
     * getRealWidth - Return the real width
     * TODO fix doc
     * @return {type}  description
     */
    getRealWidth() {
        let rotation = Math.floor(this.sprite.rotation / (Math.PI / 2));
        if (rotation === 0 || rotation === 4 || rotation == 2) return this.sprite.width;
        return this.sprite.height;
    }

    getRealHeight() {
        let rotation = Math.floor(this.sprite.rotation / (Math.PI / 2));
        if (rotation === 0 || rotation === 4 || rotation === 2) return this.sprite.height;
        return this.sprite.width;
    }

    rotateInPlace(angle) {

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
