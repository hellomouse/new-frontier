'use strict';

const CAMERA_STAGES = ['sim', 'map', 'editor'];

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

/* Click events */
window.addEventListener('click', function(e) {
    let stage = stage_handler.stages[stage_handler.current_stage];
    stage.onClick(e);
});
