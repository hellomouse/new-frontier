/* Camera class */

'use strict';

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.scale = 0.2;
        this.filter = null;
    }

    focusOn(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }

    updateScene(stage, renderer) {
        stage.pivot.x = this.x;
        stage.pivot.y = this.y;
        stage.position.x = renderer.width / 2;
        stage.position.y = renderer.height / 2;

        stage.scale.x = this.scale;
        stage.scale.y = this.scale;
    }
}

module.exports = Camera;
