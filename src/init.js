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



function update() {
    current_scene.update();

    camera.focusOn(rocket.getPos());
    camera.updateScene(stage, renderer);

    renderer.render(stage);
    requestAnimationFrame(update);
}


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
