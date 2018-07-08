'use strict';

/**
 * ImageSprites are a sprite that display an image
 */
class ImageSprite {
    /**
     * constructor - Construct an image sprite
     *
     * @param  {string} image_path Path to image
     * @param  {number} width      Width of sprite
     * @param  {string} height     Height of sprite
     */
    constructor(image_path, width, height) {
        this.sprite = new PIXI.Sprite.fromImage(image_path);
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

module.exports = ImageSprite;
