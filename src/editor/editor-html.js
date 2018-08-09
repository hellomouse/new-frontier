'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');

module.exports = `
    <div style="
        width: 100px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0
    ">${
        allParts.categories.map(x => '<button>' + x + '</button>').join('')
    }</div>
`;
