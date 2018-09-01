'use strict';

const CONVERSIONS = {
    pixelToM: 10, // 10 pixel = 1 m, assuming 1 rocket grid = 5 px
    kgToMatter: 597200000000000, // 5972000000000000000 kg = 1 matter.js mass
};

module.exports = {
    conversions: CONVERSIONS,
    pixelToMeter: p => p / CONVERSIONS.pixelToM,
    meterToPixel: m => m * CONVERSIONS.pixelToM,

    kgToMatter: kg => kg / CONVERSIONS.kgToMatter,
    matterToKg: m => m * CONVERSIONS.kgToMatter,
};
