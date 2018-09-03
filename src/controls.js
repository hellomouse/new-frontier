'use strict';

const keyboardKey = require('keyboard-key');

/* Stages with a camera */
//TODO make this automatic
const CAMERA_STAGES = ['sim', 'map', 'editor'];

let control_state = {
    mouse: {
        last_mousedown: [-1, -1],
        last_mouseup: [-1, -1],
        dragging: false,
        x: 0,
        y: 0,
        pos_event: null,
        isdown: false
    },
    keyboard: {}
};


//TODO ES6 func notation

/* Mouse wheel, zoom camera */
window.addEventListener('wheel', function(e) {
    let stage = stage_handler.getCurrentStage();

    if (CAMERA_STAGES.includes(stage_handler.current_stage)) {
        let scaleDelta = e.wheelDelta > 0 ? stage.camera.scroll_speed : 1 / stage.camera.scroll_speed;

        if (stage.camera.scale * scaleDelta > stage.camera.max_scroll || stage.camera.scale * scaleDelta < stage.camera.min_scroll) {
            return;
        }
        stage.camera.scale = +(stage.camera.scale * scaleDelta).toFixed(20);
    }
    stage.onScroll(e);
});


/* Keyboarding */
window.addEventListener('keydown', e => {
    let stage = stage_handler.getCurrentStage();
    let name = keyboardKey.getKey(e);

    stage.onKeyDown(e, name);
    control_state.keyboard[name] = true;
}, false);
window.addEventListener('keyup', e => delete control_state.keyboard[keyboardKey.getKey(e)], false);

/* Mouse */
window.addEventListener('mousedown', function(e) {
    let x = e.clientX;
    let y = e.clientY;

    control_state.mouse.dragging = false;
    control_state.mouse.last_mousedown = [x, y];
    control_state.mouse.isdown = true;

    window.addEventListener('mousemove', function(e) {
        if (Math.abs(x - e.clientX) > 5 || Math.abs(y - e.clientY) > 5)
            control_state.mouse.dragging = true;
    });
});

window.addEventListener('mousemove', function(e) {
    control_state.mouse.x = e.clientX;
    control_state.mouse.y = e.clientY;
    control_state.mouse.pos_event = e;

    let stage = stage_handler.getCurrentStage();
    stage.onMousemove(e);
});

window.addEventListener('mouseup', function(e) {
    let stage = stage_handler.getCurrentStage();

    control_state.mouse.last_mouseup = [e.clientX, e.clientY];
    control_state.mouse.isdown = false;

    switch(e.button) {
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

    control_state.mouse.dragging = false;
});

/* Copy, cut, paste */
window.addEventListener('cut', (e) => stage_handler.getCurrentStage().onCut(e));
window.addEventListener('copy', (e) => stage_handler.getCurrentStage().onCopy(e));
window.addEventListener('paste', (e) => stage_handler.getCurrentStage().onPaste(e));

module.exports = control_state;
