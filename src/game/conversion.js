'use strict';

const CONVERSIONS = {
    PIXEL_TO_M: 10, // 10 pixel = 1 m
    M_TO_PIXEL: 0.1, // 0.1 m = 1 pixel

    KG_TO_MATTER: 597200000000000, // 5972000000000000000 kg = 1 matter.js mass
    MATTER_TO_KG: 1 / 597200000000000
};

module.exports = {
    conversions: CONVERSIONS,
    pixelToMeter: p => p / CONVERSIONS.PIXEL_TO_M,
    meterToPixel: m => m / CONVERSIONS.M_TO_PIXEL,

    kgToMatter: kg => kg / CONVERSIONS.KG_TO_MATTER,
    matterToKg: m => m / CONVERSIONS.MATTER_TO_KG
}
