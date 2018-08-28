'use strict';

const keyboardKey = require('keyboard-key');

/* Stages with a camera */
const CAMERA_STAGES = ['sim', 'map', 'editor'];

let control_state = {
    mouse: {
        last_mousedown: [-1, -1],
        last_mouseup: [-1, -1],
        dragging: false
    },
    keyboard: {}
};


/* Mouse wheel, zoom camera */
window.addEventListener('wheel', function(e) {
    let stage = stage_handler.stages[stage_handler.current_stage];

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
    let stage = stage_handler.stages[stage_handler.current_stage];
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

    window.addEventListener('mousemove', function(e) {
        if (Math.abs(x - e.clientX) > 5 || Math.abs(y - e.clientY) > 5)
            control_state.mouse.dragging = true;
    });
});

window.addEventListener('mouseup', function(e) {
    let stage = stage_handler.stages[stage_handler.current_stage];
    control_state.mouse.last_mouseup = [e.clientX, e.clientY];

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


module.exports = control_state;
