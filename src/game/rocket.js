'use strict';

class Rocket {
    constructor(parts, Matter) {
        this.parts = parts;
        this.control = false;  // Can it be controlled?
        this.center_pos = {};

        this.body = Matter.Composite.create({});
        for (let part of this.parts) {
            part.rocket = this;
            Matter.Composite.add(this.body, part.body);
        }

        Matter.Events.on(this.body, 'afterAdd', this.updateCenterPos);
        Matter.Events.on(this.body, 'afterRemove', this.updateCenterPos);
        this.updateCenterPos();
    }

    /**
     * applyForceToAll - Applies a force vector
     * to all bodies in the rocket.
     *
     * @param  {Vector} vector Force vector, in format {x: num, y: num}
     */
    applyForceToAll(vector) {
        for (let body of this.body.bodies) {
            Matter.Body.applyForce(body, body.position, vector);
        }
    }

    getPos() {
        this.updateCenterPos();
        return this.center_pos;
    }

    updateCenterPos() {
        let avg_x = 0;
        let avg_y = 0;

        for (let body of this.body.bodies) {
            avg_x += body.position.x;
            avg_y += body.position.y;
        }

        this.center_pos.x = avg_x / this.body.bodies.length;
        this.center_pos.y = avg_y / this.body.bodies.length;
    }
}

module.exports = Rocket;
