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
        this.id = id;
        this.data = allParts.index_data[id];

        this.sprite = PIXI.Sprite.from(this.data.image_path);

        this.sprite.width = this.data.width;
        this.sprite.height = this.data.height;

        this.x = x;
        this.y = y;

        // this.sprite.anchor.set(0.5, 0.5);
        this.sprite.x = x;
        this.sprite.y = y;
    }

    /**
     * select - Display the part as selected
     */
    select() {
        this.sprite.tint = 0x00FF00;
    }

    /**
     * unselect - Display part as unselected
     */
    unselect() {
        this.sprite.tint = 0xFFFFFF;
    }
}

module.exports = RocketPartGraphic;
