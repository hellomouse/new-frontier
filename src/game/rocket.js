'use strict';

const Thruster = require('./rocket-parts/base-classes/thruster.js');

/**
 * A Rocket (Covers probes, debris, etc...)
 */
class Rocket {
    /**
     * constructor - Construct a new
     * Rocket object
     *
     * @param  {array} parts Array of rocket parts
     */
    constructor(parts) {
        this.parts = parts;
        this.position = {};
        this.angleToPlanet = 0;

        /* Directly modifiable */
        this.control = false; // Is it currently being controlled?
        this.controlSettings = {
            thrust: 0, // Thrust, between 0 and 1
            stages: [], // Index 0 = bottom stage
            heading: 'null' // Used for flight control SAS
        };

        /**
         * Types of rocket are:
         * - Ship: A manned rocket ship
         * - Probe: An unmanned ship
         * - Rover
         * - Satellite
         * - Relay
         * - Debris
         * - Space station
         * - Base
         */
        this.type = 'rocket';

        // TODO NEATIFY
        let minX = this.parts[0].x;
        let maxX = this.parts[0].x;
        let minY = this.parts[0].y;
        let maxY = this.parts[0].y;

        for (let part of this.parts) {
            part.rocket = this;
            part.skip_add_body = true;

            if (part.x < minX) minX = part.x;
            if (part.x + part.sprite.width > maxX) maxX = part.x + part.sprite.width;
            if (part.y < minY) minY = part.y;
            if (part.y + part.sprite.height > maxY) maxY = part.y + part.sprite.height;
        }

        this.width = maxX - minX;
        this.height = maxY - minY;

        this.body = Matter.Body.create({});
        Matter.Body.setParts(this.body, this.parts.map(x => x.body));

        this.boundaryGraphic = null;
    }

    /**
     * recover - Deletes the rocket and refunds
     * any fuel/parts/money/crew, and adds science
     * and other data obtained.
     */
    recover() {
        // TODO do the stuff above
        this.destroy();
    }

    /**
     * destroy - Destroys the rocket, killing
     * all crew without recovery.
     */
    destroy() {
        // TODO work this out
    }

    /**
     * reposition - Respositions the rocket
     * to center at the given coordinates
     *
     * @param  {number} x X coord
     * @param  {number} y Y coord
     */
    reposition(x, y) {
        Matter.Body.setPosition(this.body, { x: x, y: y });
    }

    /**
     * applyForceToAll - Applies a force vector
     * to all bodies in the rocket.
     *
     * @param  {Vector} vector Force vector, in format {x: num, y: num}
     */
    applyForceToAll(vector) {
        Matter.Body.applyForce(this.body, this.body.position, vector);
    }

    /**
     * getPos - Returns the current position
     * as a vector ({x: <number>, y: <number>})
     *
     * @return {object}  Current position
     */
    getPos() {
        this.updateCenterPos();
        return this.position;
    }

    /**
     * updateCenterPos - Recalculates center position
     * based on location of comp bodies
     *
     */
    updateCenterPos() {
        this.position = this.body.position;
    }

    /**
     *
     * @param {Object} planet
     */
    updateAngleToPlanet(planet) {
        this.angleToPlanet = Math.atan2(this.position.y - planet.position.y, this.position.x - planet.position.x);
        // gameUtil.math.fastAtan(ratio);
    }

    /**
     * Updates rocket attributes every tick
     */
    update() {
        for (let part of this.parts) {
            /* Make sure rotation is correct */
            part.body.angle = this.body.angle;

            /* Thrusters apply thrust */
            if (part instanceof Thruster) part.update(this.controlSettings.thrust);
        }

        // DEBUG
        if (this.boundaryGraphic) {
            stageHandler.getStageByName('sim').stage.removeChild(this.boundaryGraphic);
        }

        this.boundaryGraphic = new PIXI.Graphics();
        let vert = this.body.vertices;

        for (let i = 1; i < this.body.vertices.length; i++) {
            this.boundaryGraphic.lineStyle(2, 0xff0000)
               .moveTo(vert[i - 1].x, vert[i - 1].y)
               .lineTo(vert[i].x, vert[i].y);
        }

        stageHandler.getStageByName('sim').stage.addChild(this.boundaryGraphic);
    }
}

module.exports = Rocket;
