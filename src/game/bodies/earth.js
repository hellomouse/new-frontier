'use strict';

/* Required */
const Planet = require('../../game-components/bodies/planet.js');
const config = require('../config.js');

/* Util */
const conversion = require('../conversion.js');
const gameUtil = require('../../util.js');
const perlin = new (require('@mohayonao/perlin-noise'))();


/**
 * triangleWave - Return a triangle wave
 * value (Period 2PI) given x
 *
 * @param  {number} x  Input
 * @return {number}    Output
 */
function triangleWave(x) {
    let twoPi = 2 * Math.PI;
    return 2 * Math.abs(x / twoPi - Math.floor(x / twoPi + 0.5));
}

/**
 * getBiome - Return a biome type given
 * an angle
 *
 * @param  {number} angle  Angle
 * @return {string}        Biome type
 */
function getBiome(angle) {
    /* Polar biome:
     * Flat icy terrain, low friction */
    if (gameUtil.math.isAngleBetween(angle, 80, 100) || gameUtil.math.isAngleBetween(angle, 260, 280)) {
        return 'polar';
    }

    /* Tundra biome:
     * Rough, rocky / frozen surface. Somewhat low friction, still rough */
    if (gameUtil.math.isAngleBetween(angle, 70, 110) || gameUtil.math.isAngleBetween(angle, 250, 290)) {
        return 'tundra';
    }

    /* Mountain biome:
     * Very rough and high terrain, somewhat high friction */
    if (gameUtil.math.isAngleBetween(angle, 130, 145) || gameUtil.math.isAngleBetween(angle, 310, 330)) {
        return 'mountain';
    }
    return 'flat';
}


/**
 * terrainGenerator - Terrain generator for earth
 * Generate a terrain given an angle
 *
 * @param  {number} angle Angle of the sector
 * @param  {object} planet
 * @return {number} Height at point
 */
function terrainGenerator(angle, planet) {
    angle = -angle; // Sector angles are reversed for some reason
    let biome = getBiome(angle);

    switch (biome) {
        case 'polar': return planet.radius + conversion.meterToPixel(100);
        case 'tundra': return planet.radius + conversion.meterToPixel(40) * perlin.noise(10000 * angle);
        case 'mountain': {
            /* Subtracter to force the sin curve to be 0 at the edges of the mountain */
            let dtheta = gameUtil.math.isAngleBetween(angle, 130, 145) ?
                130 / 180 * Math.PI : 310 / 180 * Math.PI;
            /* Larger = more peaks */
            let multiplier = 150;
            let sinH = Math.abs(triangleWave(multiplier * (angle - dtheta)));

            return planet.radius
                + conversion.meterToPixel(12000 * perlin.noise(100 * angle)) * sinH
                + conversion.meterToPixel(500) * perlin.noise(10000 * angle) * sinH;
        }
        default: return planet.radius;
    }

     /* Grassland biome:
      * Flat biome, slightly rough, high friction */

     /* Desert biome:
      * Very flag biome, rough, land is relatively smooth */
}

/** */
class Earth extends Planet {
    /**
     * @constructor
     * @param {*} x
     * @param {*} y
     */
    constructor(x, y) {
        super(x, y);

        this.orbitalE = 0; // Eccentricity
        this.orbitalDistance = 0;
        this.rotationSpeed = 0;
        this.sphereOfInfluence = 0;
        this.orbits = null; // What does it orbit?

        this.radius = conversion.meterToPixel(1274 * 1000);
        this.mass = conversion.kgToMatter(5.972e22);
        this.density = this.mass / (this.radius ** 2 * 3.1415926535);

        this.atmosphere = {
            present: true,
            height: conversion.meterToPixel(100 * 1000),
            oxygen: true,
            molarWeight: 0.0288,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#00FF00';
        this.surface = {
            ocean: true,
            oceanLevel: conversion.meterToPixel(12742 * 1000),
            oceanType: 'water',

            getHeight: angle => terrainGenerator(angle, this),
            getBiome: angle => getBiome(angle)
        };

        // Science and info
        this.desc = ''
            + ''
            + '';

        // Map stuff
        this.image = config.imgPath + 'planets/default.png';
        this.mapSprite = null; // Created in map.js
        this.minRadius = this.radius - conversion.meterToPixel(100); // Smallest possible height of the planet
    }

    /** */
    update() {
        // Pretend to be a physicalsprite
    }
}

module.exports = Earth;
