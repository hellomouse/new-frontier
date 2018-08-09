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

    <div id="parts" style="
        width: 250px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 100px
    ">${
        allParts.parts_data.map(x => `<img style='float: left; width: 50px; height: 50px'
            src='${x.image_path}'>`).join('')
    }</div>
`;
