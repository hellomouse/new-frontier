'use strict';

const Planet = require('../../game-components/planet.js');
const conversion = require('../conversion.js');
const gameUtil = require('../../util.js');
const perlin = new (require('@mohayonao/perlin-noise'))();


/**
 * terrainGenerator - Terrain generator for earth
 * Generate a terrain given an angle
 *
 * @param  {number} angle Angle of the sector
 * @return {number}       Height at point
 */
function terrainGenerator(angle, planet) {
    angle = -angle;  // Sector angles are reversed

    /* Polar biome:
     * Flat icy terrain, low friction */
    if (gameUtil.math.isAngleBetween(angle, 80, 100) || gameUtil.math.isAngleBetween(angle, 260, 280)) {
        return planet.radius + conversion.meterToPixel(100);
    }

    /* Tundra biome:
     * Rough, rocky / frozen surface. Somewhat low friction, still rough */
     if (gameUtil.math.isAngleBetween(angle, 70, 110) || gameUtil.math.isAngleBetween(angle, 250, 290)) {
         return planet.radius
            + conversion.meterToPixel(40) * perlin.noise(10000 * angle);
     }

     /* Grassland biome:
      * Flat biome, slightly rough, high friction */

     /* Desert biome:
      * Very flag biome, rough, land is relatively smooth */




    //TODO more realistic mountain generation
    //Moutains should follow a general low -> high -> low shape, and perlin
    //nois is mere randomizer
    //make mountain follow a sin curve or something

    /* Mountain biome:
     * Very rough and high terrain, somewhat high friction */
    if (gameUtil.math.isAngleBetween(angle, 132, 143) || gameUtil.math.isAngleBetween(angle, 312, 328)) {
        return planet.radius
            + conversion.meterToPixel(1000) * perlin.noise(10000 * angle);
    }

    /* Small mountain biome:
    * Transitional biome, same as mountain but with lower mountains */
    if (gameUtil.math.isAngleBetween(angle, 130, 145) || gameUtil.math.isAngleBetween(angle, 310, 330)) {
        return planet.radius
            + conversion.meterToPixel(300) * perlin.noise(10000 * angle);
    }

    return planet.radius;
}



class Earth extends Planet {
    constructor(x, y) {
        super(x, y);

        this.orbital_e = 0;  // Eccentricity
        this.orbital_distance = 0;
        this.rotation_speed = 0;
        this.sphere_of_influence = 0;
        this.orbits = null;  // What does it orbit?

        this.radius = conversion.meterToPixel(1274 * 1000);
        this.mass = conversion.kgToMatter(5.972e22);
        this.density = this.mass / (this.radius ** 2 * 3.1415926535);

        this.atmosphere = {
            present: true,
            height: conversion.meterToPixel(100 * 1000),
            oxygen: true,
            molar_weight: 0.0288,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#00FF00';
        this.surface = {
            ocean: true,
            ocean_level: conversion.meterToPixel(12742 * 1000),
            ocean_type: 'water',

            getHeight: angle => terrainGenerator(angle, this)
        };

        this.sectors = {};

        // Science and info
        this.desc = ''
            + ''
            + ''

        // Map stuff
        this.image = '../assets/planets/default.png';
        this.map_sprite = null; // Created in map.js
        this.min_radius = this.radius - conversion.meterToPixel(100); // Smallest possible height of the planet
    }

    update() {
        //Pretend to be a physicalsprite
    }
}

module.exports = Earth;
