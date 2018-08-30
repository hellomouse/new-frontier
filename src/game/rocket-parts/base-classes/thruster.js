'use strict';

const RocketPart = require('../../../game-components/rocket-part.js');

/**
 * A Thruster
 */
class Thruster extends RocketPart {
    /**
     * constructor - Thruster
     *
     * @param  {string} image_path Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     * @param  {number} thrust     Thrust power
     * @param  {number} burn_rate  Burn rate (kg/frame)
     */
    constructor(image_path, width, height, x, y, data, id, thrust, burn_rate) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        super(image_path, width, height, x, y, data, id);
        this.thrust = thrust;
        this.burn_rate = burn_rate;

        // This class should not be constructed directly
        // To avoid confusion this will throw a new error
        if (new.target === Thruster) {
            throw new TypeError('Cannot construct Abstract instances directly - Thruster is abstract');
        }

        // Debug
        this.debug_graphics = null;
    }

    /**
     * Update method. this.rocket is set
     * in the Rocket class
     */
    update(multiplier = 1) {
        super.update();

        /**
         * Angle of 0 = rocket is facing upwards. Thrust components
         * is determiend by the following forumla:
         *
         * x = -sin(angle) * thrust
         * y = -cos(angle) * thrust
         */
        let angle = -this.rocket.body.angle;
        let fx = -this.thrust * multiplier * Math.sin(angle);
        let fy = -this.thrust * multiplier * Math.cos(angle);

        let center_x = Matter.Vertices.centre(this.body.vertices).x; // The center of the part
        let center_y = Matter.Vertices.centre(this.body.vertices).y; // The center of the part

        let thrust_x = center_x + (Math.sin(angle) * this.sprite.height * 0.5); // x + (sin(angle) * height) / 2
        let thrust_y = center_y + (Math.cos(angle) * this.sprite.height * 0.5); // y + (cos(angle)  * height) / 2

        let new_pos = { // The position of the force.
            x: thrust_x,
            y: thrust_y
        };

        if (fx !== 0 || fy !== 0) {
            Matter.Body.applyForce(
                this.rocket.body,
                new_pos, { x: fx, y: fy });
        }

        // DEBUG
        if (this.debug_graphics) {
            stage_handler.getStageByName('sim').stage.removeChild(this.debug_graphics);
        }

        this.debug_graphics = new PIXI.Graphics();
        this.debug_graphics.lineStyle(30, 0xff0000)
           .moveTo(new_pos.x, new_pos.y)
           .lineTo( Math.floor(new_pos.x - fx * 100000), Math.floor(new_pos.y - fy * 100000));

        this.debug_graphics.beginFill(0xFFFFFF, 1).lineStyle(1, 0xFFFFFF).drawCircle(new_pos.x, new_pos.y, 5);
        this.debug_graphics.beginFill(0xFFFF00, 1).lineStyle(1, 0xFFFF00).drawCircle(Math.floor(new_pos.x - fx * 10000000000), Math.floor(new_pos.y - fy * 10000000000), 5);
        stage_handler.getStageByName('sim').stage.addChild(this.debug_graphics);
    }
}

module.exports = Thruster;
