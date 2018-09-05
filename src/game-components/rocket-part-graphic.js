'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');
const gameUtil = require('../util.js');

/**
 * A graphic for a rocket part used in the
 * rocket editor. Graphical only. "Translated" into
 * a complete rocket part when the rocket
 * is constructed
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
        this.data = allParts.indexData[id];

        /* Sprite data */
        this.sprite = PIXI.Sprite.from(this.data.image_path);
        this.sprite.width = this.data.width;
        this.sprite.height = this.data.height;
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.anchor.set(0.5, 0.5);

        /* Alias for sprite.x and sprite.y */
        this.x = x;
        this.y = y;

        /* Other variables */
        this.selected = false;
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
        return gameUtil.math.isBetween(x, bounds[0], bounds[1]) &&
               gameUtil.math.isBetween(y, bounds[2], bounds[3]);
    }

    /**
     * getBounds - Return bounds of the sprite in an array
     * of the top-left and bottom-right corner of the rectangle
     * the sprite occupies
     *
     * @return {array}  [x1, y1, x2, y2]
     */
    getBounds() {
        return [this.x - this.getRealWidth() / 2, this.x + this.getRealWidth() / 2,
                this.y - this.getRealHeight() / 2, this.y + this.getRealHeight() / 2];
    }

    /**
     * getRealWidth - Return the width of the sprite,
     * accounting for rotation.
     *
     * @return {number}  Width of sprite
     */
    getRealWidth() {
        if (this.is180Rotation()) return this.sprite.width;
        return this.sprite.height;
    }

    /**
     * getRealHeight - Return the height of the sprite,
     * accounting for rotation.
     *
     * @return {number}  Height of sprite
     */
    getRealHeight() {
        if (this.is180Rotation()) return this.sprite.height;
        return this.sprite.width;
    }

    /**
     * getSnapX - Get the nearest multiple of a grid
     * that the item will snap to on the x axis, accounting
     * for rotation
     *
     * @return {number}  x snap
     */
    getSnapX() {
        return !this.is180Rotation() ? this.data.data.min_snap_multiplier_y : this.data.data.min_snap_multiplier_x;
    }

    /**
     * getSnapY - Get the nearest multiple of a grid
     * that the item will snap to on the y axis, accounting
     * for rotation
     *
     * @return {number}  y snap
     */
    getSnapY() {
        return this.is180Rotation() ? this.data.data.min_snap_multiplier_y : this.data.data.min_snap_multiplier_x;
    }

    /**
     * is180Rotation - Is the sprite's current
     * rotation a multiple of 180 DEG? (Used to
     * adjust some variables for rotation, not useful
     * outside of this class)
     *
     * @return {boolean}  Is current rotation a multiple of 180 deg
     */
    is180Rotation() {
        let rotation = Math.round(this.sprite.rotation / (Math.PI / 2));
        return rotation === 0 || rotation === 4 || rotation === 2;
    }

    /**
     * rotateInPlace - Rotate the current sprite in place
     * by an angle (radian)
     *
     * @param  {number} angle radian to rotate CC
     */
    rotateInPlace(angle) {
        this.sprite.rotation += angle;
    }

    /**
     * select - Display the part as selected,
     * and update selected state
     */
    select() {
        this.sprite.tint = 0x00FF00;
        this.selected = true;
    }

    /**
     * unselect - Display part as unselected,
     * and update selected state
     */
    unselect() {
        this.sprite.tint = 0xFFFFFF;
        this.selected = false;
    }

    /**
     * moveTo - Moves sprite to new location,
     * updating this.x and this.y as well.
     *
     * DO NOT DIRECTLY SET .x and .y, or
     * sprite.x and sprite.y! Use this!
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
     * DO NOT DIRECTLY SET .x and .y, or
     * sprite.x and sprite.y! Use this!
     *
     * @param  {number} dx X pos cahnge
     * @param  {number} dy Y pos change
     */
    moveToRelative(dx, dy) {
        this.moveTo(this.x + dx, this.y + dy);
    }
}

module.exports = RocketPartGraphic;
