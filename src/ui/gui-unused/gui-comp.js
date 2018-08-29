'use strict';

class GuiComponent {
    constructor(sprite, x, y) {
        this.x = x;
        this.y = y;
        this.sprite = sprite;

        // Setup
        this.sprite.interactive = true;
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }
}

module.exports = GuiComponent;
