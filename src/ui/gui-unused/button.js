'use strict';

const GuiComponent = require('./gui-comp.js');
const DEFAULT_BUTTON_TEXTURES = {
    default: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0'),
    hover: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0'),
    active: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0')
};


class Button {
    constructor(x, y, w, h) {
        super(new PIXI.Sprite(DEFAULT_BUTTON_TEXTURES.default), x, y);

        this.button_textures = DEFAULT_BUTTON_TEXTURES;
        this.sprite.buttonMode = true;
        this.sprite.width = w;
        this.sprite.height = h;

        this.sprite
             .on('pointerdown', this.onButtonDown)
             .on('pointerup', this.onButtonUp)
             .on('pointerupoutside', this.onButtonUp)
             .on('pointerover', this.onButtonOver)
             .on('pointerout', this.onButtonOut);
    }

    onButtonDown() {
        // Called when button is clicked on
        this.sprite.isdown = true;
        this.sprite.texture = this.button_textures.default;
        this.sprite.alpha = 1;
    }

    onButtonUp() {
        this.sprite.isdown = false;
        this.sprite.texture = this.sprite.isOver ?
            this.button_textures.hover :
            this.button_textures.default;
    }

    onButtonOver() {
        this.sprite.isOver = true;
        if (this.sprite.isdown) {
            return;
        }
        this.sprites.texture = this.button_textures.hover;
    }

    onButtonOut() {
        this.sprite.isOver = false;
        if (this.sprite.isdown) {
            return;
        }
        this.texture = this.button_textures.default;
    }
}

module.exports = Button;
