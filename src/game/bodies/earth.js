'use strict';

const Planet = require('../../game-components/planet.js');

class Earth extends Planet {
    constructor(x, y) {
        super(x, y);

        this.radius = 1000;
        this.mass = 100000;

        this.createBody();
        this.body.mass = 500 //5.972 * 10**24 (Real value freezes application - Need workaround to handle large values and forces)
    }

    addToStage(PIXI, stage) {
        let graphics = new PIXI.Graphics();

        graphics.beginFill(0xe74c3c); // Red
        graphics.drawCircle(this.position.x, this.position.y, this.radius);
        graphics.endFill();

        stage.addChild(graphics);
    }

    update() {
        //Pretend to be a physicalsprite
    }
}

module.exports = Earth;
