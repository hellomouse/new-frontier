# Making a Planet
So you want to add a new planet into the game? This tutorial will get you started.

**Note 1: This tutorial only creates a Planet, and not other types of celestial bodies such as stars. While those follow a similar pattern, see the other tutorials (if they exist)**

**Note 2: The tutorial for making a moon is IDENTICAL to the one of making a planet, except you require `../../game-components/bodies/moon.js` in place of Planet**

## Before Making It
You should have some of these things in mind before making your planet.

- What it looks like
- The different types of biomes it will have (Including ground textures, temperatures, etc...)
- Size, mass, atmosphere, oceans and other physical properties
- Orbital data

## Starting Off
Under `src/game/bodies`, create a new file called `[Your Planet Name].js`. Paste in the template below, and edit the contents of the file to your liking. **Remove helper comments if you actually do push to dev, a version without comments is at the end of the tutorial**
```javascript
'use strict';

// Required 'requires'
const Planet = require('../../game-components/bodies/planet.js');
const config = require('../config.js');

// Not 'required' but very helpful
const conversion = require('../conversion.js');
const gameUtil = require('../../util.js');
const perlin = new (require('@mohayonao/perlin-noise'))();

/**
 * getBiome - Return a biome type given
 * an angle
 *
 * @param  {number} angle  Angle (rad)
 * @return {string}        Biome type
 */
function getBiome(angle) {
    /* Basically, we're given an angle in radians
     * (0 = 'east', PI / 2 = 'north', etc...)
     * and we need to return the biome type as a string.
     *
     * Biome types are defined in src/game/biomes.js. If you wish
     * to add a new biome, edit it there.
     *
     * NOTE: Biome does not determine terrain height.
     */

     /* We want a bit of ice at the poles. We can use
      * gameUtil.math.isAngleBetween(radian angle, low (deg), high (deg))
      * This makes it easier than dealing with radians.
      *
      * In this case, if the angle is between 80 to 100 DEG or 260 to 280 DEG,
      * we'll return the biome as 'polar'
      */
     if (gameUtil.math.isAngleBetween(angle, 80, 100) || gameUtil.math.isAngleBetween(angle, 260, 280)) {
         return 'polar';
     }

     /* We can add some random mountain ranges around the planet as above */
     if (gameUtil.math.isAngleBetween(angle, 120, 140) || gameUtil.math.isAngleBetween(angle, 270, 290)) {
         return 'mountain';
     }

    /* Rest of the planet is just flat terrain */
    return 'flat';
}

/**
 * terrainGenerator - Terrain generator for MyPlanet
 * Generate a terrain given an angle
 *
 * @param  {number} angle Angle of the sector (rad)
 * @return {number}       Height at point
 */
function terrainGenerator(angle, planet) {
    /* We want our terrain to be based on biome (optional)
     * so let's get the biome type first */
    let biome = getBiome(angle);

    switch(biome) {
        case 'polar':
            /* We want some flat polar ice caps. So we return the height
             * of the ground FROM THE CENTER OF THE PLANET. In this case we
             * can just do planet.radius + 10 meters, which can be converted
             * to pixels using conversion */
            return planet.radius + conversion.meterToPixel(10);
        case 'mountain':
            /* We want some mountains, so we can take mountains in a random height
             * between 0 and 40 m above 'sea level'. We can use the perlin.noise
             * method, seeding it with the current angle * 10000 (To increase the
             * 'randomness' of the terrain). See wikipedia for perlin noise */
            return planet.radius + conversion.meterToPixel(40) * perlin.noise(10000 * angle);
        case 'flat':
            /* Flat terrain can just be set to 'sea level' */
            return planet.radius;
        default: return planet.radius;
    }
}

/**
 * The planet class we will be creating. This will be a
 * earth sized rocky planet with no life. It is a
 * mostly smooth planet with some small hills/mountains
 * in various places. There will be a water ocean.
 */
class MyPlanet extends Planet {
    constructor(x, y) {
        /* This is needed, sets planet's x-y pos */
        super(x, y);

        /* For a full list of variables you can change see src/game-components/planet.js */
        this.orbital_e = 0;             // Orbital eccentricity   
        this.orbital_distance = 0;      // Orbital distance (px)
        this.rotation_speed = 0;        // Rotational speed (rad/s)
        this.sphere_of_influence = 0;   // Sphere of influence (px)
        this.orbits = null;             // Planet object that it orbits around

        this.radius = conversion.meterToPixel(1274 * 1000);    
        this.mass = conversion.kgToMatter(5.972e22);
        this.density = this.mass / (this.radius ** 2 * Math.PI);

        /* Atmosphere settings */
        this.atmosphere = {
            present: true,
            height: conversion.meterToPixel(100 * 1000),
            oxygen: true,
            molar_weight: 0.0288,

            getTemperature: height => 1,
            getDrag: height => height > this.radius + this.atmosphere.height ? 0 : 0.01
        };

        this.color = '#AAAAAA';
        this.surface = {
            ocean: true,
            ocean_level: conversion.meterToPixel(12742 * 1000),
            ocean_type: 'water',

            getHeight: angle => terrainGenerator(angle, this),
            getBiome: angle => getBiome(angle)
        };

        // Science and info
        this.desc = 'MyPlanet: A small rockety planet with no atmosphere and water oceans';

        // Map stuff
        this.image = config.IMG_PATH + 'planets/default.png';

        this.min_radius = this.radius - conversion.meterToPixel(100); // Smallest possible height of the planet. Important to get this right, used for optimizations.
    }

    update() {
        // Update something every frame.
    }
}

module.exports = MyPlanet;
```

## Atmosphere and Oceans
TODO

## Creating an Image
If you look into `assets/img/planets` the `default.png` file is an excellent template for your image. When drawing your planet, you should consider which way is north and south (Some planets might rotate sideways, in which case 90 DEG = North. Or maybe it's like most planets and north is facing out of the screen.

Image should be saved in `assets/img/planets`. Then set `this.image` in your planet class; the image will only be used to display the planet in the map.


## No Comment Template
```javascript
'use strict';

const Planet = require('../../game-components/bodies/planet.js');
const config = require('../config.js');
const conversion = require('../conversion.js');
const gameUtil = require('../../util.js');
const perlin = new (require('@mohayonao/perlin-noise'))();

/**
 * getBiome - Return a biome type given
 * an angle
 *
 * @param  {number} angle  Angle (rad)
 * @return {string}        Biome type
 */
function getBiome(angle) {
    return 'flat';
}

/**
 * terrainGenerator - Terrain generator for MyPlanet
 * Generate a terrain given an angle
 *
 * @param  {number} angle Angle of the sector (rad)
 * @return {number}       Height at point
 */
function terrainGenerator(angle, planet) {
    let biome = getBiome(angle);

    switch(biome) {
        case 'mountain': return planet.radius + conversion.meterToPixel(40) * perlin.noise(10000 * angle);
        default: return planet.radius;
    }
}

/**
 * The planet class we will be creating. This will be a
 * earth sized rocky planet with no life. It is a
 * mostly smooth planet with some small hills/mountains
 * in various places. There will be a water ocean.
 */
class MyPlanet extends Planet {
    constructor(x, y) {
        super(x, y);

        this.orbital_e = 0;      
        this.orbital_distance = 0;
        this.rotation_speed = 0;
        this.sphere_of_influence = 0;
        this.orbits = null;        

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

        this.color = '#AAAAAA';
        this.surface = {
            ocean: true,
            ocean_level: conversion.meterToPixel(12742 * 1000),
            ocean_type: 'water',

            getHeight: angle => terrainGenerator(angle, this),
            getBiome: angle => getBiome(angle)
        };

        // Science and info
        this.desc = 'MyPlanet: A small rockety planet with no atmosphere and water oceans';

        // Map stuff
        this.image = config.IMG_PATH + 'planets/default.png';
        this.min_radius = this.radius - conversion.meterToPixel(100); // Smallest possible height of the planet
    }

    update() {
        // Update something every frame.
    }
}

module.exports = MyPlanet;
```
