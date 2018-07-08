'use strict';

/**
 * This file acts like a template for a planet/moon. Extend
 * this class and override all variables
 */
class Planet {
    constructor() {
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

            getHeight: angle => 1
        };
    }
}
