'use strict';

const config = require('../game/config.js');

/**
 * This file acts like a template for a planet/moon. Extend
 * this class and override all variables
 */
class Planet {
    constructor(x, y) {
        this.position = {x: x, y: y};

        this.orbital_e = 0;  // Eccentricity
        this.orbital_distance = 0;
        this.rotation_speed = 0;
        this.sphere_of_influence = 0;
        this.orbits = null;  // What does it orbit?

        this.radius = 0;
        this.mass = 0;
        this.density = this.mass / (this.radius ** 2 * 3.1415926535);

        this.atmosphere = {
            present: true,
            height: 0,
            oxygen: true,
            molar_weight: 0,

            getPressure: height => 1,
            getTemperature: height => 1
        };

        this.color = '#FFFFFF';
        this.surface = {
            ocean: true,
            ocean_level: 0,
            ocean_type: 'water',

            getHeight: angle => this.radius
        };
    }

    createBody() {
        //TODO don't render planet ody, use sectors
        this.body = Matter.Bodies.circle(this.position.x, this.position.y, 2);
        this.body.label = 'Planet';
        Matter.Body.setStatic(this.body, true); // Planets are static bodies
    }

    addToStage(PIXI, stage) {
        let graphics = new PIXI.Graphics();

        graphics.beginFill(0xe74c3c); // Red
        graphics.drawCircle(this.position.x, this.position.y, this.radius);
        graphics.endFill();

        stage.addChild(graphics);
    }

    applyGravity(rocket) {
        // Calculate force magnitude to apply
        let x1 = rocket.position.x;
        let y1 = rocket.position.y;
        let x2 = this.position.x;
        let y2 = this.position.y;

        let f_mag = config.G_CONSTANT * 1 * this.mass / ((x1 - x2) ** 2 + (y1 - y2) ** 2);

        // Calculate force direction to apply
        let angle = Math.atan2(y2 - y1, x2 - x1);
        //console.log(angle, angle * 180 / Math.PI)
        //console.log(f_mag)
        //console.log({x: f_mag * Math.cos(angle), y: f_mag * Math.sin(angle)})

        rocket.applyForceToAll({x: f_mag * Math.cos(angle), y: f_mag * Math.sin(angle)});
    }
}

module.exports = Planet;
