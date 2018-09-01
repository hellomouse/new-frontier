'use strict';

const GuiComponent = require('./gui-comp.js');
const defaultButtonTextures = {
    default: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0'),
    hover: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0'),
    active: PIXI.Texture.fromImage('https://dl.dropboxusercontent.com/s/mi2cibdajml8qj9/arrow_wait.png?dl=0')
};

/** */
class Button {
    /**
     * @constructor
     * @param {*} x
     * @param {*} y
     * @param {*} w
     * @param {*} h
     */
    constructor(x, y, w, h) {
        super(new PIXI.Sprite(defaultButtonTextures.default), x, y);

        this.buttonTextures = defaultButtonTextures;
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

    /** */
    onButtonDown() {
        // Called when button is clicked on
        this.sprite.isDown = true;
        this.sprite.texture = this.buttonTextures.default;
        this.sprite.alpha = 1;
    }

    /** */
    onButtonUp() {
        this.sprite.isDown = false;
        this.sprite.texture = this.sprite.isOver ?
            this.buttonTextures.hover :
            this.buttonTextures.default;
    }

    /** */
    onButtonOver() {
        this.sprite.isOver = true;
        if (this.sprite.isDown) {
            return;
        }
        this.sprites.texture = this.buttonTextures.hover;
    }

    /** */
    onButtonOut() {
        this.sprite.isOver = false;
        if (this.sprite.isDown) {
            return;
        }
        this.texture = this.buttonTextures.default;
    }
}

module.exports = Button;
