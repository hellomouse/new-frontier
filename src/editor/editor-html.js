'use strict';

const allParts = require('../game/rocket-parts/all-parts.js');
const config = require('../game/config.js');
const controlState = require('../controls.js');

const categoryIconSize = 40;
const partIconSize = 40;

/* Some specific HTML functions that needed to be injected
 * into the global namespace */

/* Setup global */

global.editorFunctions = global.editorFunctions ? global.editorFunctions : {};

/* Create the functions */
global.editorFunctions.changeEditorBuild = function(id, button) {
    scenes.editor.currentSelectBuild = scenes.editor.currentSelectBuild === id ? null : id;
    scenes.editor.updatedSelectedIcon(controlState.mouse.posEvent);
};

global.editorFunctions.spawnCurrentRocketAtLaunchPad = function() {
    let rocket = stageHandler.getCurrentStage().constructRocket();

    rocket.control = true;
    scenes.sim.addRocket(rocket);

    console.log(rocket);

    stageHandler.switchStage('sim');
};

/* Load the actual html */
module.exports = `
    <div style="
        width: ${categoryIconSize}px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        background-color: #111;
        padding-top: ${categoryIconSize * 0.075}px;
    " class="noselect"
    id="editor-left-1">${
        allParts.categories.map(x => `<img
            width=${categoryIconSize * 0.85}px
            height=${categoryIconSize * 0.85}px
            style="
                margin: 0 ${categoryIconSize * 0.075}px 0 ${categoryIconSize * 0.075}px;
                clip: rect(0px, ${categoryIconSize * 0.15}px, ${categoryIconSize}px, ${categoryIconSize * 0.85}px);
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
        left: ${categoryIconSize}px;
        background-color: rgba(0, 0, 0, 0.9);
    " class="noselect"
    >${
        allParts.partsData.map(x => {
            let xRatio = x.width / Math.max(x.width, x.height);
            let yRatio = x.height / Math.max(x.width, x.height);

            return `<img style="
                float: left;
                width: ${xRatio * partIconSize }px;
                height: ${yRatio * partIconSize }px;
                padding:
                        ${partIconSize / 2 - yRatio * partIconSize / 2}px
                        ${partIconSize / 2 - xRatio * partIconSize / 2}px
                        ${partIconSize / 2 - yRatio * partIconSize / 2}px
                        ${partIconSize / 2 - xRatio * partIconSize / 2 }px;
                margin: 2.5px;
                border: 1px solid gray;
            "
            src='${x.imagePath}' id="part-button-${x.id}"
                onclick='editorFunctions.changeEditorBuild("${x.id}", this);'>`;
        }).join('')
    }</div>

    <img id="follow-mouse-editor-icon" style="
            z-index: 1;
            width: ${config.buildGridSize}px;
            height: ${config.buildGridSize}px;
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
