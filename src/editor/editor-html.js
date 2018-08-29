'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');
const config = require('../game/config.js');
const control_state = require('../controls.js');

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
                background-color: #AAA;
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
            src='${x.image_path}' id="part-button-${x.id}" onclick='editorFunctions.changeEditorBuild("${x.id}", this);'>`;
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
