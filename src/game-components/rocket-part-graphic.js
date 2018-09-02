'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');

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
        this.moving = false;
        this.validLocation = true;

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
