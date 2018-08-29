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

let parts_data = [];
let all_parts_index = {};
let all_parts_index_data = {};

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
const ALL_PARTS = dir
    .files(__dirname, { sync: true })
    .filter(isBlacklist)
    .map(x => require(x));

// Alert any parts that contain invalid categories
ALL_PARTS.forEach(x => {
    let t = new x();  // x is class for a rocket part

    // Warnings
    if (!CATEGORIES.includes(t.data.category)) {
        console.warn(t.id + ' does not belong in any valid category! (Category: ' + t.data.category + ')');
    }
    if (all_parts_index[t.id]) {
        console.warn('Duplicate id ' + t.id + ' present.');
    }

    // More data
    let data = {
        width: t.sprite.width,
        height: t.sprite.height,
        data: t.data,
        id: t.id,
        image_path: t.image_path
    };

    all_parts_index[t.id] = x;
    all_parts_index_data[t.id] = data;
    parts_data.push(data);
});

module.exports = {
    parts: ALL_PARTS,
    categories: CATEGORIES,
    parts_data: parts_data,
    index: all_parts_index,
    index_data: all_parts_index_data
};
