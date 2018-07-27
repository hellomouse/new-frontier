'use strict';

module.exports = {
    // Build grid
    build_grid_size: 50,

    // Planets
    planet_sector_size: 0.523599 / 40960, // Size of a sector in rad
    planet_sector_inc: 0.00001,     // Increment for precision of each sector
    planet_graphic_sector_size: 0.523599 / 40960 * 200,
    planet_graphic_sector_inc: 0.00001,

    // Biomes
    biomes: {  // TODO move to another file
        'polar': {
            temperature: -40 + 273.15,
            friction: 0.01,
            frictionStatic: 0.05
        },
        'flat': {
            temperature: 15 + 273.15,
            friction: 0.1,
            frictionStatic: 0.5
        },
        'tundra': {
            temperature: -20 + 273.15,
            friction: 0.06,
            frictionStatic: 0.4
        },
        'mountain': {
            temperature: 3 + 273.15,
            firction: 0.15,
            frictionStatic: 0.6
        }
    },

    // Physics
    G_CONSTANT: 2000,

    // Game
    MIN_SCROLL: 0.005,
    MAX_SCROLL: 2.5,
    SCROLL_SPEED: 1.1
};
