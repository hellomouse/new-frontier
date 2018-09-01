'use strict';

const dir = require('node-dir');

const CATEGORIES = [
    'Command',
    'Fuel',
    'Thruster',
    'Structural',
    'Coupling',
    'Payload',
    'Aerodynamics',
    'Thermal',
    'Electrical',
    'Communication',
    'Utility',
    'Habitat'
];

let partsData = [];
let allPartsIndex = {};
let allPartsIndexData = {};

/**
 * const isBlacklist - Is a path in
 * the blacklist (aka not a rocket-part)
 * but in the rocket-parts dir
 *
 * @param  {string} path Path to file
 * @return {boolean}
 */
const isBlacklist = function(path) {
    path = path.replace(/\\/g, '/');
    return !(
        path.includes('/base-classes') ||
        path.includes('/all-parts.js'));
};

// Load all parts
const allParts = dir
    .files(__dirname, { sync: true })
    .filter(isBlacklist)
    .map(x => require(x));

// Alert any parts that contain invalid categories
allParts.forEach(x => {
    let t = new x(); // x is class for a rocket part

    // Warnings
    if (!CATEGORIES.includes(t.data.category)) {
        console.warn(t.id + ' does not belong in any valid category! (Category: ' + t.data.category + ')');
    }
    if (allPartsIndex[t.id]) {
        console.warn('Duplicate id ' + t.id + ' present.');
    }

    // More data
    let data = {
        width: t.sprite.width,
        height: t.sprite.height,
        data: t.data,
        id: t.id,
        imagePath: t.imagePath
    };

    allPartsIndex[t.id] = x;
    allPartsIndexData[t.id] = data;
    partsData.push(data);
});

module.exports = {
    parts: allParts,
    categories: CATEGORIES,
    partsData: partsData,
    index: allPartsIndex,
    index_data: allPartsIndexData
};
