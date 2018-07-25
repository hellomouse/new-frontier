'use strict';

const Planet = require('../../game-components/planet.js');
const conversion = require('../conversion.js');

class Earth extends Planet {
    constructor(x, y) {
        super(x, y);

        this.orbital_e = 0;  // Eccentricity
        this.orbital_distance = 0;
        this.rotation_speed = 0;
        this.sphere_of_influence = 0;
        this.orbits = null;  // What does it orbit?

        this.radius = conversion.meterToPixel(12742 * 1000);
        this.mass = conversion.kgToMatter(5.972e24);
        this.density = this.mass / (this.radius ** 2 * 3.1415926535);

        this.atmosphere = {
            present: true,
            height: conversion.meterToPixel(100),
            oxygen: true,
            molar_weight: 0,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#00FF00';
        this.surface = {
            ocean: true,
            ocean_level: conversion.meterToPixel(12742 * 1000),
            ocean_type: 'water',

            getHeight: angle => this.radius + Math.sin(angle * 100) * 1000
        };

        this.sectors = {};

        // Map stuff
        this.image = '../assets/planets/default.png';
        this.map_sprite = null; // Created in map.js
    }

    update() {
        //Pretend to be a physicalsprite
    }
}

module.exports = Earth;
