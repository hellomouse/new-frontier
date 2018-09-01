'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');
const config = require('../game/config.js');
const control_state = require('../controls.js');

const properties = require('../game/rocket-parts/property-formatter.js');
const units = require('../game/units.js');

const CATEGORY_ICON_SIZE = 40;
const PART_ICON_SIZE = 40;

/* Some specific HTML functions that needed to be injected
 * into the global namespace */

/* Setup global */
global.editorFunctions = global.editorFunctions ? global.editorFunctions : {};

/* Create the functions */
global.editorFunctions.changeEditorBuild = function(id, button) {
    scenes.editor.current_select_build = scenes.editor.current_select_build === id ? null : id;
    scenes.editor.updatedSelectedIcon(control_state.mouse.pos_event);
}

global.editorFunctions.displayPartData = function(id) {
    let container = document.getElementById('part-desc');
    let left_half = document.getElementById('part-desc-1');
    let right_half = document.getElementById('part-desc-2');

    let data = allParts.index_data[id];

    container.style.display = 'inline';
    left_half.innerHTML = `
        <span style="color: #9CEA65">
            <b>Mass: </b>${data.data.mass} kg<br>
            <b>Tolerance: </b>${data.data.tolerance.impact} ${units.velocity[0]} impact<br>
            <b>Tolerance: </b>${data.data.tolerance.acceleration} ${units.gravity_accel[0]},
                              ${data.data.tolerance.pressure} ${units.pressure[0]}<br>
            <b>Max Temp: </b>${data.data.tolerance.temperature} ${units.temperature[0]}<br>
        </span>
        <span style="color: #7CBCC2">
            <b>Cost: </b>${units.cost[0]}${data.data.cost}
        </span>

        <hr style="height: 0; border-bottom: 1px solid black">
        <span style="color: #DDD">
            <b>${data.id}</b>
            <p>${data.data.description}</p>
        </span>
    `;

    right_half.innerHTML = `
    <span style="color: #7CBCC2">
    ${
        Object.keys(data.properties.static ? data.properties.static : {})
            .filter(x => properties[x] && properties[x].display)
            .map(x => '<b>' + properties[x].display_name +'</b> ' + data.properties.static[x] + ' ' + properties[x].unit).join('<br>')
    }
    </span>
    `;
}

global.editorFunctions.spawnCurrentRocketAtLaunchPad = function() {
    let rocket = stage_handler.getCurrentStage().constructRocket();

    rocket.control = true;
    scenes.sim.addRocket(rocket);

    console.log(rocket)

    stage_handler.switchStage('sim');
}

/* Load the actual html */
module.exports = `
    <div style="
        width: ${CATEGORY_ICON_SIZE}px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #111;
        padding-top: ${CATEGORY_ICON_SIZE * 0.075}px;
    " class="noselect"
    id="editor-left-1">${
        allParts.categories.map(x => `<img
            width=${CATEGORY_ICON_SIZE * 0.85}px
            height=${CATEGORY_ICON_SIZE * 0.85}px
            style="
                margin: 0 ${CATEGORY_ICON_SIZE * 0.075}px 0 ${CATEGORY_ICON_SIZE * 0.075}px;
                clip: rect(0px, ${CATEGORY_ICON_SIZE * 0.15}px, ${CATEGORY_ICON_SIZE}px, ${CATEGORY_ICON_SIZE * 0.85}px);
                background-color: #DDD
            "
            class="brighten-on-hover cursor-on-hover"
            src="../assets/img/icons/${x.toLowerCase()}.png"
            alt="${x}"></img>`).join('')
    }</div>

    <div id="parts" style="
        width: 250px;
        height: 100%;
        position: absolute;
        top: 0;
        left: ${CATEGORY_ICON_SIZE}px;
        background-color: rgba(0, 0, 0, 0.9);
    " class="noselect"
    >${
        allParts.parts_data.map(x => {
            let x_ratio = x.width / Math.max(x.width, x.height);
            let y_ratio = x.height / Math.max(x.width, x.height);

            return `<img style="
                float: left;
                width: ${x_ratio * PART_ICON_SIZE }px;
                height: ${y_ratio * PART_ICON_SIZE }px;
                padding:
                        ${PART_ICON_SIZE / 2  - y_ratio * PART_ICON_SIZE / 2}px
                        ${PART_ICON_SIZE / 2 - x_ratio * PART_ICON_SIZE / 2}px
                        ${PART_ICON_SIZE / 2 - y_ratio * PART_ICON_SIZE / 2}px
                        ${PART_ICON_SIZE / 2 - x_ratio * PART_ICON_SIZE / 2 }px;
                margin: 2.5px;
                border: 1px solid gray;
            "
            src='${x.image_path}' id="part-button-${x.id}"
            onclick='editorFunctions.changeEditorBuild("${x.id}", this);'
            onmouseover='editorFunctions.displayPartData("${x.id}")'
            onmouseleave='document.getElementById("part-desc").style.display = "none";'>`;
        }).join('')
    }</div>

    <img id="follow-mouse-editor-icon" style="
            z-index: 1;
            width: ${config.build_grid_size}px;
            height: ${config.build_grid_size}px;
            position: absolute;
            top: 0;
            left: 0;
            display: none;
            pointer-events: none;
        " class="noselect"
        src="">

    <div id="part-desc"
         style="
             width: 360px;
             height: auto;
             min-height: 100px;
             position: absolute;
             top: 0;
             left: ${CATEGORY_ICON_SIZE + 250}px;
             background-color: rgba(0, 0, 0, 0.7);
             display: none;
             pointer-events: none;
         ">
         <div id="part-desc-1" style="width: 170px; float: left; margin: 5px;"></div>
         <div id="part-desc-2" style="width: 170px; float: left; margin: 5px;"></div>
    </div>

    <div style="
        width: 500px;
        height: 50px;
        position: absolute;
        top: 0;
        right: 0;
        text-align: right;
    " class="noselect"
    id="editor-top">
        <button onclick="editorFunctions.spawnCurrentRocketAtLaunchPad()">LAUNCH</button>
    </div>
`;
