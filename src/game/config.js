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
    biomes: require('./biomes.js'),

    // Physics
    G_CONSTANT: 2000,

    // Game
    MIN_SCROLL: 0.005,
    MAX_SCROLL: 50,
    SCROLL_SPEED: 1.1,

    // Editor
    EDITOR_X_SIZE: 30,
    EDITOR_Y_SIZE: 100,

    // File
    IMG_PATH: '../assets/img/'
};
