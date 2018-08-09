'use strict';

class Rocket {
    constructor(parts, Matter) {
        this.parts = parts;
        this.control = false;  // Can it be controlled?
        this.position = {};
        this.angle_to_planet = 0;

        this.comp = Matter.Composite.create({});

        for (let part of this.parts) {
            part.rocket = this;
            Matter.Composite.add(this.comp, part.body);
        }

        this.body = Matter.Body.create({parts: this.parts.map(x => x.body)});

        Matter.Events.on(this.comp, 'afterAdd', this.updateCenterPos);
        Matter.Events.on(this.comp, 'afterRemove', this.updateCenterPos);
        this.updateCenterPos();
    }

    /**
     * applyForceToAll - Applies a force vector
     * to all bodies in the rocket.
     *
     * @param  {Vector} vector Force vector, in format {x: num, y: num}
     */
    applyForceToAll(vector) {
        Matter.Body.applyForce(this.body, this.body.position, vector);
        /* for (let body of this.comp.bodies) {
            Matter.Body.applyForce(body, body.position, vector);
        } */
    }

    getPos() {
        this.updateCenterPos();
        return this.position;
    }

    updateCenterPos() {
        let avg_x = 0;
        let avg_y = 0;

        for (let body of this.comp.bodies) {
            avg_x += body.position.x;
            avg_y += body.position.y;
        }

        this.position.x = avg_x / this.comp.bodies.length;
        this.position.y = avg_y / this.comp.bodies.length;
        Matter.Body.setPosition(this.body, this.position);
    }

    updateAngleToPlanet(planet) {
        this.angle_to_planet = Math.atan2(this.position.y - planet.position.y, this.position.x - planet.position.x); // gameUtil.math.fastAtan(ratio);
    }

    update() {
        // Make sure rotation is consistent
        for (let body of this.comp.bodies) {
            body.angle = this.body.angle;
        }
    }
}

module.exports = Rocket;
