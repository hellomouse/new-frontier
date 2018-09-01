'use strict';

/**
 * imageSprites are a sprite that display an image
 */
class imageSprite {
    /**
     * constructor - Construct an image sprite
     *
     * @param  {string} imagePath Path to image
     * @param  {number} width      Width of sprite
     * @param  {string} height     Height of sprite
     */
    constructor(imagePath, width, height) {
        this.sprite = new PIXI.Sprite.fromImage(imagePath);
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.anchor.set(0.5, 0.5);
    }

    /**
     * Does nothing yet. Should do something when extended
     */
    update() {
        // Do nothing yet
    }
}

module.exports = imageSprite;
