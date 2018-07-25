'use strict';

const config = require('../game/config.js');
const PlanetSector = require('./planet-sector.js');
const gameUtil = require('../util.js');

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

        this.image = '../assets/planets/default.png';
        this.map_sprite = null; // Created in map.js

        this.atmosphere = {
            present: true,
            height: 100,
            oxygen: true,
            molar_weight: 0,

            getPressure: height => 1,
            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#FFFFFF';
        this.surface = {
            ocean: true,
            ocean_level: 0,
            ocean_type: 'water',

            getHeight: angle => this.radius + Math.sin(angle * 100) * 1000
        };

        this.sectors = {};
    }

    /**
     * getSector - Given a position, updates this.sectors
     * and add it to the world
     *
     * @param  {Vector} position Position of rocket, in {x, y} coordinates
     */
    updateSector(position, sim) {
        let angle = Math.atan2(position.y - this.position.y, position.x - this.position.x); // gameUtil.math.fastAtan(ratio);
        let added = false;

        // Round angle to lowest multiple of a PLANET_SECTOR_SIZE
        for (let i=-1; i<=1; i++) {
            angle = Math.floor(angle / config.planet_sector_size + i) * config.planet_sector_size;

            // Sector already exists
            if (this.sectors[angle]) continue;

            console.log("Adding sector, angle " + (angle / 3.1415926535 * 180))
            this.sectors[angle] = new PlanetSector(angle, this);
            World.add(sim.engine.world, this.sectors[angle].body);
            added = true;
        }

        /* Trim extra angles that are too far away */
        if (added) {
            for (let a of Object.keys(this.sectors)) {
                if (Math.abs(angle - a) > config.planet_sector_size * 2) {
                    console.log("Removing sector")
                    Matter.Composite.remove(sim.engine.world, this.sectors[a].body);
                    delete this.sectors[a];
                }
            }
        }
    }

    addToStage(PIXI, stage) {
        let graphics = new PIXI.Graphics();

        graphics.beginFill(0xe74c3c); // Red
        graphics.drawCircle(this.position.x, this.position.y, this.radius);
        graphics.endFill();

        //stage.addChild(graphics);
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
