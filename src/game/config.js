'use strict';

module.exports = {
    // Build grid
    buildGridSize: 52,

    // Planets
    planetSectorSize: 0.523599 / 40960 * 10, // Size of a sector in rad
    planetSectorInc: 0.00001, // Increment for precision of each sector
    planetGraphicSectorSize: 0.523599 / 40960 * 200,
    planetGraphicSectorInc: 0.00001,
    planetSectorAmount: 2,

    // Biomes
    biomes: require('./biomes.js'),

    // Physics
    gConstant: 2000,

    // Editor
    editorXSize: 30,
    editorYSize: 100,

    // File
    imgPath: '../assets/img/'
};
