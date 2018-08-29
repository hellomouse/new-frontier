/* Camera class */

'use strict';

/**
 * The Camera class
 */
class Camera {
    /**
     * constructor - Camera class
     *
     * @param  {number} min_zoom=0.005   Min zoom (scale)
     * @param  {number} max_zoom=50      Max zoom (scale)
     * @param  {number} start_zoom=0.2   Initial zoom (scale)
     * @param  {number} scroll_speed=1.1 Scroll speed (multiplier)
     */
    constructor(min_zoom=0.005, max_zoom=50, start_zoom=0.2, scroll_speed=1.1) {
        this.x = 0;
        this.y = 0;
        this.scale = start_zoom;
        this.filter = null;

        this.min_scroll = min_zoom;
        this.max_scroll = max_zoom;
        this.scroll_speed = scroll_speed;
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
