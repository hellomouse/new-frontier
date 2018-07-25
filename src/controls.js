'use strict';

const CAMERA_STAGES = ['sim', 'map'];

/* Mouse wheel, zoom camera */
window.addEventListener('wheel', function(e) {
    if (CAMERA_STAGES.includes(stage_handler.current_stage)) {
        let scaleDelta = e.wheelDelta > 0 ? config.SCROLL_SPEED : 1 / config.SCROLL_SPEED;
        let stage = stage_handler.stages[stage_handler.current_stage];

        if (stage.camera.scale * scaleDelta > config.MAX_SCROLL || stage.camera.scale * scaleDelta < config.MIN_SCROLL) {
            return;
        }
        stage.camera.scale = +(stage.camera.scale * scaleDelta).toFixed(4);
    }
});
