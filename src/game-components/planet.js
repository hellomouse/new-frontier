'use strict';

const config = require('../game/config.js');
const gameUtil = require('../util.js');

const PlanetSector = require('./planet-sector.js');
const PlanetSectorGraphic = require('./planet-sector-graphic.js');

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
            height: 100,
            oxygen: true,
            molar_weight: 0,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#FFFFFF';
        this.surface = {
            ocean: true,
            ocean_level: 0,
            ocean_type: 'water',

            getHeight: angle => this.radius + Math.sin(angle * 10) * 1000
        };

        this.sectors = {};
        this.texture_sectors = {};
        this.sectors_to_delete = []; // Optimization for deleting matter.js sectors

        // Science and info
        this.desc = 'Default planet desc';

        // Graphics stuff
        this.image = '../assets/planets/default.png';
        this.map_image = '../assets/planets/default.png';
        this.map_sprite = null; // Created in map.js
        this.min_radius = this.radius; // Smallest possible height of the planet
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
            let angle2 = Math.floor(angle / config.planet_sector_size + i) * config.planet_sector_size;

            // Sector already exists
            if (this.sectors[angle2]) continue;

            this.sectors[angle2] = new PlanetSector(angle2, this);
            World.add(sim.engine.world, this.sectors[angle2].body);
            added = true;
        }

        // Add graphical sectors
        for (let i=-1; i<=1; i++) {
            let angle2 = Math.floor(angle / config.planet_graphic_sector_size + i) * config.planet_graphic_sector_size;

            // Sector already exists
            if (this.texture_sectors[angle2]) continue;

            this.texture_sectors[angle2] = new PlanetSectorGraphic(angle2, this, sim.stage);
        }

        /* Trim extra angles that are too far away */
        if (added) {
            for (let a of Object.keys(this.sectors)) {
                if (Math.abs(angle - a) > config.planet_sector_size * 5) {
                    // Matter.Composite.remove(sim.engine.world, this.sectors[a].body);
                    Matter.Sleeping.set(this.sectors[a].body, true);
                    this.sectors[a].body.collision
                    this.sectors_to_delete.push(this.sectors[a].body);
                    delete this.sectors[a];
                }

                if (Math.abs(angle - a) > config.planet_graphic_sector_size * 5) {
                    sim.stage.removeChild(this.texture_sectors[a].body);
                    delete this.texture_sectors[a];
                }
            }
        }

        /* Delete matter.js bodies in one swoop */
        if (this.sectors_to_delete.length > 30 || Math.random() < 0.05) {
            for (let sector of this.sectors_to_delete) {
                Matter.Composite.remove(sim.engine.world, sector);
            }
        }
    }

    addToStage(PIXI, stage) {
        let sprite = new PIXI.Sprite.fromImage(this.image);

        sprite.width = this.min_radius * 1.988;
        sprite.height = this.min_radius * 1.988;
        sprite.anchor.set(0.5, 0.5);

        sprite.x = this.position.x;
        sprite.y = this.position.y;

        stage.addChild(sprite);
    }

    applyGravity(rocket) {
        let x1 = this.position.x;
        let y1 = this.position.y;
        let x2 = rocket.position.x;
        let y2 = rocket.position.y;

        let f_mag = config.G_CONSTANT * this.mass * rocket.body.mass / ((x1 - x2) ** 2 + (y1 - y2) ** 2);
        let angle = Math.atan2(y1 - y2, x1 - x2);

        let vector = {x: f_mag * Math.cos(angle), y: f_mag * Math.sin(angle)};
        Matter.Body.applyForce(rocket.body, rocket.position, vector);
    }
}

module.exports = Planet;
