'use strict';

const rocketPart = require('../../../game-components/rocket-part.js');

/**
 * A thruster
 */
class thruster extends rocketPart {
    /**
     * constructor - thruster
     *
     * @param  {string} imagePath Path to image
     * @param  {number} width      Width of part
     * @param  {number} height     Height of part
     * @param  {number} x          X pos
     * @param  {number} y          Y pos
     * @param  {object} data       Data, see below for desc and format
     * @param  {string} id         Unique ID name for the part
     * @param  {number} thrust     Thrust power
     * @param  {number} burnRate  Burn rate (kg/frame)
     */
    constructor(imagePath, width, height, x, y, data, id, thrust, burnRate) {
        /* Blocks are the same size as the image they're from
         * and are static. Non-static blocks should be an entitySprite */
        super(imagePath, width, height, x, y, data, id);
        this.thrust = thrust;
        this.burnRate = burnRate;

        // This class should not be constructed directly
        // To avoid confusion this will throw a new error
        if (new.target === thruster) {
            throw new TypeError('Cannot construct Abstract instances directly - thruster is abstract');
        }

        // Debug
        this.debugGraphics = null;
    }

    /**
     * Update method. this.rocket is set
     * in the Rocket class
     * @param {number}  multiplier
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

        let centerX = Matter.Vertices.centre(this.body.vertices).x; // The center of the part
        let centerY = Matter.Vertices.centre(this.body.vertices).y; // The center of the part

        let thrustX = centerX + (Math.sin(angle) * this.sprite.height * 0.5); // x + (sin(angle) * height) / 2
        let thrustY = centerY + (Math.cos(angle) * this.sprite.height * 0.5); // y + (cos(angle)  * height) / 2

        let newPos = { // The position of the force.
            x: thrustX,
            y: thrustY
        };

        if (fx !== 0 || fy !== 0) {
            Matter.Body.applyForce(
                this.rocket.body,
                newPos, { x: fx, y: fy });
        }

        // DEBUG
        if (this.debugGraphics) {
            stageHandler.getStageByName('sim').stage.removeChild(this.debugGraphics);
        }

        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.lineStyle(30, 0xff0000)
           .moveTo(newPos.x, newPos.y)
           .lineTo( Math.floor(newPos.x - fx * 100000), Math.floor(newPos.y - fy * 100000));

        this.debugGraphics.beginFill(0xFFFFFF, 1).lineStyle(1, 0xFFFFFF).drawCircle(newPos.x, newPos.y, 5);
        this.debugGraphics.beginFill(0xFFFF00, 1).lineStyle(1, 0xFFFF00).drawCircle(Math.floor(newPos.x -
            fx * 10000000000), Math.floor(newPos.y - fy * 10000000000), 5);
        stageHandler.getStageByName('sim').stage.addChild(this.debugGraphics);
    }
}

module.exports = thruster;
