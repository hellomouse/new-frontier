'use strict';

module.exports = {
    // Build grid
    build_grid_size: 50,
    planet_sector_size: 0.523599 / 1024, // Size of a sector in rad
    planet_sector_inc: 0.001,     // Increment for precision of each sector

    // Physics
    G_CONSTANT: 2000,

    // Game
    MIN_SCROLL: 0.005,
    MAX_SCROLL: 2.5,
    SCROLL_SPEED: 1.1
};
