'use strict';

const CONVERSIONS = {
    PIXEL_TO_M: 10, // 10 pixel = 1 m, assuming 1 rocket grid = 5 px
    KG_TO_MATTER: 597200000000000, // 5972000000000000000 kg = 1 matter.js mass
};

module.exports = {
    conversions: CONVERSIONS,
    pixelToMeter: p => p / CONVERSIONS.PIXEL_TO_M,
    meterToPixel: m => m * CONVERSIONS.PIXEL_TO_M,

    kgToMatter: kg => kg / CONVERSIONS.KG_TO_MATTER,
    matterToKg: m => m * CONVERSIONS.KG_TO_MATTER,
};
