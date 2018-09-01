'use strict';

const keyboardKey = require('keyboard-key');

/* Stages with a camera */
const cameraStages = ['sim', 'map', 'editor'];

let controlState = {
    mouse: {
        lastMousedown: [-1, -1],
        lastMouseup: [-1, -1],
        dragging: false,
        x: 0,
        y: 0,
        posEvent: null,
        isDown: false
    },
    keyboard: {}
};


/* Mouse wheel, zoom camera */
window.addEventListener('wheel', function(e) {
    let stage = stageHandler.stages[stageHandler.currentStage];

    if (cameraStages.includes(stageHandler.currentStage)) {
        let scaleDelta = e.wheelDelta > 0 ? stage.camera.scrollSpeed : 1 / stage.camera.scrollSpeed;

        if (stage.camera.scale * scaleDelta > stage.camera.maxScroll || stage.camera.scale *
                scaleDelta < stage.camera.minScroll) {
            return;
        }
        stage.camera.scale = +(stage.camera.scale * scaleDelta).toFixed(20);
    }
    stage.onScroll(e);
});


/* Keyboarding */
window.addEventListener('keydown', e => {
    let stage = stageHandler.stages[stageHandler.currentStage];
    let name = keyboardKey.getKey(e);

    stage.onKeyDown(e, name);
    controlState.keyboard[name] = true;
}, false);
window.addEventListener('keyup', e => delete controlState.keyboard[keyboardKey.getKey(e)], false);

/* Mouse */
window.addEventListener('mousedown', function(e) {
    let x = e.clientX;
    let y = e.clientY;

    controlState.mouse.dragging = false;
    controlState.mouse.lastMousedown = [x, y];
    controlState.mouse.isDown = true;

    window.addEventListener('mousemove', function(e) {
        if (Math.abs(x - e.clientX) > 5 || Math.abs(y - e.clientY) > 5) {
controlState.mouse.dragging = true;
}
    });
});

window.addEventListener('mousemove', function(e) {
    controlState.mouse.x = e.clientX;
    controlState.mouse.y = e.clientY;
    controlState.mouse.posEvent = e;

    let stage = stageHandler.stages[stageHandler.currentStage];
    stage.onMousemove(e);
});

window.addEventListener('mouseup', function(e) {
    let stage = stageHandler.stages[stageHandler.currentStage];

    controlState.mouse.lastMouseup = [e.clientX, e.clientY];
    controlState.mouse.isDown = false;

    switch (e.button) {
        case 0: {
            stage.onLeftClick(e);
            break;
        }
        case 1: {
            break;
        }
        case 2: {
            stage.onRightClick(e);
            break;
        }
    }

    controlState.mouse.dragging = false;
});


module.exports = controlState;
