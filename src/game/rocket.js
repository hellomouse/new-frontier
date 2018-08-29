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
        this.angle_to_planet = 0;

        /* Directly modifiable */
        this.control = false;  // Is it currently being controlled?
        this.control_settings = {
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
        let min_x = this.parts[0].x;
        let max_x = this.parts[0].x;
        let min_y = this.parts[0].y;
        let max_y = this.parts[0].y;

        for (let part of this.parts) {
            part.rocket = this;
            part.skip_add_body = true;

            if (part.x < min_x) min_x = part.x;
            if (part.x + part.sprite.width > max_x) max_x = part.x + part.sprite.width;
            if (part.y < min_y) min_y = part.y;
            if (part.y + part.sprite.height > max_y) max_y = part.y + part.sprite.height;
        }

        this.width = max_x - min_x;
        this.height = max_y - min_y;

        this.body = Matter.Body.create({});
        Matter.Body.setParts(this.body, this.parts.map(x => x.body));

        this.boundary_graphic = null;
    }

    // Controls
    set_thrust(thrust=1) {

        return this.control_settings.thrust = thrust <= 0 ? 0 : thrust >= 1 ? 1 : thrust;

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
        //TODO work this out
    }

    /**
     * reposition - Respositions the rocket
     * to center at the given coordinates
     *
     * @param  {number} x X coord
     * @param  {number} y Y coord
     */
    reposition(x, y) {
        Matter.Body.setPosition(this.body, {x: x, y: y});
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
     * @return {type}  description
     */
    updateCenterPos() {
        this.position = this.body.position;
    }

    updateAngleToPlanet(planet) {
        this.angle_to_planet = Math.atan2(this.position.y - planet.position.y, this.position.x - planet.position.x); // gameUtil.math.fastAtan(ratio);
    }

    update() {

        for (let part of this.parts) {
            /* Make sure rotation is correct */
            part.body.angle = this.body.angle;

            /* Thrusters apply thrust */
            if (part instanceof Thruster) part.update(this.control_settings.thrust);
        }

        // DEBUG
        if (this.boundary_graphic) {
            stage_handler.getStageByName('sim').stage.removeChild(this.boundary_graphic);
        }

        this.boundary_graphic = new PIXI.Graphics();
        let vert = this.body.vertices;

        for (let i=1;i<this.body.vertices.length;i++) {
            this.boundary_graphic.lineStyle(2, 0xff0000)
               .moveTo(vert[i-1].x, vert[i-1].y)
               .lineTo(vert[i].x, vert[i].y);
        }

        stage_handler.getStageByName('sim').stage.addChild(this.boundary_graphic);

    }
}

module.exports = Rocket;
