/* Init script, sets up the main libaries
 * and rendering */

'use strict';

/* Textures won't get blurry on scale (no float-coordinates) */
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/* For relative require */
let {remote} = require('electron');
let path = require('path');

remote.app.setAppPath(process.cwd());
let appPath = remote.app.getAppPath();

/* Require some modules */
const Scene = require(path.resolve(appPath, './src/scene.js'));
const Camera = require(path.resolve(appPath, './src/ui/camera.js'));

const config = require(path.resolve(appPath, './src/game/config.js'));

const Earth = require(path.resolve(appPath, './src/game/bodies/earth.js'));
const PhysicalSprite = require(path.resolve(appPath, './src/components/physical-sprite.js'));

const Rocket = require(path.resolve(appPath, './src/game/rocket.js'));
const Thruster = require(path.resolve(appPath, './src/game/rocket-parts/thruster/thruster-normal.js'));
const FuelTank = require(path.resolve(appPath, './src/game/rocket-parts/fuel/fuel-tank-normal.js'));

let blocks = [
    new FuelTank(90, 400),
    new FuelTank(90, 350),
    new FuelTank(90, 300),
    //new Thruster(90, 450)
];

let earth = new Earth(0, -1000);
let rocket = new Rocket(blocks, Matter);


const camera = new Camera();

/* Alias for matter.js */
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

/* ----- Setup ------ */
/* Stage and renderer for pixi.js */
let stage, renderer;

/* Physics engine for matter.js */
let engine = Engine.create();


let current_scene = new Scene(
    blocks,
    [],
    [rocket.body, earth.body],
    [rocket],
    null,
    'test-level'
);

/* Game rules */
var ruleDoGravity = true;

let far;

function init(){
    resetAll();

    engine.world.gravity.y = 0;                 // Disable gravity
    current_scene.load(stage, World, engine);   // Load the current scene (Add all objects)
    World.add(engine.world, []);                // Init the current world

    // Start the scene
    Engine.run(engine);
    renderer.render(stage);
    requestAnimationFrame(update);

    // Add all the planets
    earth.addToStage(PIXI, stage);
}


// Gravity
function update() {
    current_scene.update();

    camera.focusOn(rocket.getPos());
    camera.updateScene(stage, renderer);

    let bodies = engine.world.bodies
    for (var i = 0; i < bodies.length; i++) {
        if (!ruleDoGravity) break;
        let originalBody = bodies[i]
        if (originalBody.label != 'Planet') continue;
        for (var j = 0; j < bodies.length - i; j++) {
            let targetBody = bodies[j]
            if (targetBody.label == 'Planet') continue; // static body

            // Calculate force magnitude to apply
            let x1 = targetBody.position.x;
            let y1 = targetBody.position.y;
            let x2 = originalBody.position.x;
            let y2 = originalBody.position.y;

            // Newstons law of Universal Gravitation - The force between the two bodies
            // G((m1*m2)/distance^2)
            //console.log(`Origin Body: ${originalBody.label}, Target Body: ${targetBody.label}`)
            //console.log(`Gravitational Constant ${config.G_CONSTANT}, Origin Mass ${originalBody.mass}, targetBodyMass ${targetBody.mass}`)
            let f_mag = config.G_CONSTANT * originalBody.mass * targetBody.mass / ((x1 - x2) ** 2 + (y1 - y2) ** 2);

            // Calculate force direction to apply
            let angle = Math.atan2(y2 - y1, x2 - x1);
            //console.log(angle, angle * 180 / Math.PI)
            //console.log(f_mag)

            let vector = {x: f_mag * Math.cos(angle), y: f_mag * Math.sin(angle)}
            Matter.Body.applyForce(targetBody, targetBody.position, vector);
        }
    }

    renderer.render(stage);
    requestAnimationFrame(update);
}

window.addEventListener('wheel', function(e) {
    let scaleDelta = e.wheelDelta > 0 ? config.SCROLL_SPEED : 1 / config.SCROLL_SPEED;

    if (camera.scale * scaleDelta > config.MAX_SCROLL || camera.scale * scaleDelta < config.MIN_SCROLL) {
        return;
    }
    camera.scale = +(camera.scale * scaleDelta).toFixed(4);
});

/**
 * resetAll - Resets the World, engine, stage
 * and renderer to default values.
 *
 * @return {None}  Doesn't return anything
 */
function resetAll(){
    // Clear any previous worlds and renderers
    //if(World && engine)
    //    World.clear();

    engine = Engine.create();
    stage = new PIXI.Container();
    renderer = PIXI.autoDetectRenderer(
        window.innerWidth,
        window.innerHeight,
        { view: document.getElementById('canvas') }
    );
}


module.exports = {
    resetAll: resetAll
};
