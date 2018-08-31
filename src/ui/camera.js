/* Camera class */

'use strict';

/**
 * The Camera class
 */
class Camera {
    /**
     * constructor - Camera class
     *
     * @param  {number} minZoom=0.005   Min zoom (scale)
     * @param  {number} maxZoom=50      Max zoom (scale)
     * @param  {number} startZoom=0.2   Initial zoom (scale)
     * @param  {number} scrollSpeed=1.1 Scroll speed (multiplier)
     */
    constructor(minZoom = 0.005, maxZoom = 50, startZoom = 0.2, scrollSpeed = 1.1) {
        this.x = 0;
        this.y = 0;
        this.scale = startZoom;
        this.filter = null;

        this.minScroll = minZoom;
        this.maxScroll = maxZoom;
        this.scrollSpeed = scrollSpeed;
    }

    /**
     * focusOn - Focus on coordinates
     * Vector in format {x: <number>, y: <number>}
     *
     * @param  {object} pos Position vector
     */
    focusOn(pos) {
        this.x = pos.x;
        this.y = pos.y;
    }

    /**
     * updateScene - Update camera zoom, movement, etc...
     * in the stage.
     *
     * @param  {PIXI.Container} stage    Container
     * @param  {PIXI.Renderer} renderer  Renderer
     */
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
