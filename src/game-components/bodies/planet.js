'use strict';

const config = require('../../game/config.js');
const gameUtil = require('../../util.js');

const PlanetSector = require('../planet-sector.js');
const PlanetSectorGraphic = require('../planet-sector-graphic.js');

/**
 * This file acts like a template for a planet/moon. Extend
 * this class and override all variables
 */
class Planet {
    /**
     * @constructor
     * @param {int} x
     * @param {int} y
     */
    constructor(x, y) {
        this.position = { x: x, y: y };

        this.orbitalE = 0; // Eccentricity
        this.orbitalDistance = 0;
        this.rotationSpeed = 0;
        this.sphereOfInfluence = 0;
        this.orbits = null; // What does it orbit?

        this.radius = 0;
        this.mass = 0;
        this.density = this.mass / (this.radius ** 2 * 3.1415926535);

        this.atmosphere = {
            present: true,
            height: 100,
            oxygen: true,
            molarWeight: 0,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#FFFFFF';
        this.surface = {
            ocean: true,
            oceanLevel: 0,
            oceanType: 'water',

            getHeight: angle => this.radius + Math.sin(angle * 10) * 1000,
            getBiome: angle => 'null biome'
        };

        this.sectors = {};
        this.textureSectors = {};
        this.sectorsToDelete = []; // Optimization for deleting matter.js sectors

        // Science and info
        this.desc = 'Default planet desc';

        // Graphics stuff
        this.image = config.imgPath + 'planets/default.png';
        this.mapImage = config.imgPath + 'planets/default.png';
        this.mapSprite = null; // Created in map.js
        this.minRadius = this.radius; // Smallest possible height of the planet
    }

    /**
     * updateSector - Given a position, updates this.sectors
     * and add it to the world
     *
     * @param  {number} angle    Angle of rocket to planet center (rad)
     * @param  {Simulation} sim  Sim object
     */
    updateSector(angle, sim) {
        let added = false;

        // Round angle to lowest multiple of a planetSectorSize
        for (let i = -config.planetSectorAmount / 2; i <= config.planetSectorAmount / 2; i++) {
            let angle2 = Math.floor(angle / config.planetSectorSize + i) * config.planetSectorSize;

            // Sector already exists
            if (this.sectors[angle2]) continue;

            this.sectors[angle2] = new PlanetSector(angle2, this);
            Matter.World.add(sim.engine.world, this.sectors[angle2].body);
            added = true;
        }

        /* Trim extra angles that are too far away */
        if (added) {
            for (let a of Object.keys(this.sectors)) {
                if (Math.abs(angle - a) > config.planetSectorSize * config.planetSectorAmount) {
                    // Matter.Composite.remove(sim.engine.world, this.sectors[a].body);
                    Matter.Sleeping.set(this.sectors[a].body, true);
                    this.sectors[a].body.collision;
                    this.sectorsToDelete.push(this.sectors[a].body);
                    delete this.sectors[a];
                }
            }
        }

        /* Delete matter.js bodies in one swoop */
        if (this.sectorsToDelete.length > 30 || Math.random() < 0.05) {
            for (let sector of this.sectorsToDelete) {
                Matter.Composite.remove(sim.engine.world, sector);
            }
        }
    }

    /**
     * @method
     * @param {*} angle
     * @param {*} sim
     * @param {*} graphicSectorScale
     */
    updateGraphicSector(angle, sim, graphicSectorScale) {
        let added = false;

        for (let i = -3; i <= 3; i++) {
            let angle2 = Math.floor(angle / config.planetGraphicSectorSize + i * graphicSectorScale)
                * config.planetGraphicSectorSize;

            // Sector already exists
            if (this.textureSectors[angle2]) continue;

            this.textureSectors[angle2] = new PlanetSectorGraphic(angle2, this, sim.stage, {},
                config.planetGraphicSectorSize * graphicSectorScale,
                config.planetGraphicSectorInc * graphicSectorScale
            );
        }

        /* Trim extra angles that are too far away */
        if (added) {
            for (let a of Object.keys(this.textureSectors)) {
                if (Math.abs(angle - a) > config.planetGraphicSectorSize * 7 * graphicSectorScale) {
                    sim.stage.removeChild(this.textureSectors[a].body);
                    delete this.textureSectors[a];
                }
            }
        }
    }

    /**
     * @method
     * @param {*} PIXI
     * @param {*} stage
     */
    addToStage(PIXI, stage) {
        /* let sprite = new PIXI.Sprite.fromImage(this.image);

        sprite.width = this.minRadius * 1.988;
        sprite.height = this.minRadius * 1.988;
        sprite.anchor.set(0.5, 0.5);

        sprite.x = this.position.x;
        sprite.y = this.position.y;

        stage.addChild(sprite); */
    }

    /**
     * @method
     * @param {*} rocket
     */
    applyGravity(rocket) {
        let x = this.position.x;
        let y = this.position.y;
        let xRocket = rocket.position.x;
        let yRocket = rocket.position.y;

        let xDistance = x - xRocket;
        let yDistance = y - yRocket;
        let distanceMagSquare = xDistance ** 2 + yDistance ** 2;

         // F due to gravity = (g)(mass1)(mass2)/(distance between**2)
        let fMag = (config.gConstant * this.mass * rocket.body.mass) / distanceMagSquare;
        let angle = Math.atan2(yDistance, xDistance);

        let vector = { x: fMag * Math.cos(angle), y: fMag * Math.sin(angle) };
        Matter.Body.applyForce(rocket.body, rocket.position, vector);
    }
}

module.exports = Planet;
