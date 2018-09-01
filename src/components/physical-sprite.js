'use strict';

const ImageSprite = require('./image-sprite.js');


/**
 * PhysicalSprite class
 *
 * A sprite that is subject to the laws of physics.
 * Pass a matter.js body object to the sprite.
 */
class PhysicalSprite extends ImageSprite {
    /**
     * constructor - Construct a PhysicalSprite
     *
     * @param  {type} imagePath Path to the image, relative from src/init.js
     * @param  {type} width      Width of image to display (px)
     * @param  {type} height     Height of image to display (px)
     * @param  {type} body       Matter.js body for the sprite
     */
    constructor(imagePath, width, height, body) {
        super(imagePath, width, height);
        this.body = body;
        this.skipAddBody = false; // Should it skip adding the body (Ie it's part of a compound object)
    }

    /**
     * update - Update the display location of the sprite
     * based on its current physical location.
     */
    update() {
        this.sprite.x = this.body.position.x;
        this.sprite.y = this.body.position.y;
        this.sprite.rotation = this.body.angle;
    }
}

module.exports = PhysicalSprite;
