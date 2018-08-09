'use strict';

const dir = require('node-dir');

const isBlacklist = function(path) {
    path = path.replace(/\\/g, '/');
    return !(
        path.includes('/base-classes') ||
        path.includes('/all-parts.js'));
};

const ALL_PARTS = dir
    .files(__dirname, { sync: true })
    .filter(isBlacklist)
    .map(x => require(x));

module.exports = ALL_PARTS;
