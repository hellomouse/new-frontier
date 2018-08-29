/* Init script, sets up the main libaries
 * and rendering */

'use strict';

const PIXI = require('pixi.js');
const path = require('path');
/* Textures won't get blurry on scale (no float-coordinates) */
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

/* Require some modules */
const Scene = require('./game-components/physical-scene.js');
const StageHandler = require('./ui/stage-handler.js');

const config = require('./game/config.js');

const Earth = require('./game/bodies/earth.js');
const PhysicalSprite = require('./components/physical-sprite.js');

const Rocket = require('./game/rocket.js');
const Thruster = require('./game/rocket-parts/thruster/thruster-normal.js');
const FuelTank = require('./game/rocket-parts/fuel/fuel-tank-normal.js');

/*
let blocks = [
    new FuelTank(90, 400),
    new FuelTank(90, 350),
    new FuelTank(90, 300),
    //new Thruster(90, 450)
];*/

let earth = new Earth(0, 0);

//130 = Mountain
//90 = polar
//100 = tundra
let a = 90;
a = 180 - a;
earth.position.y = earth.radius * Math.sin(a / 180 * Math.PI) + 3000;
earth.position.x = earth.radius * Math.cos(a / 180 * Math.PI);
// let rocket = new Rocket(blocks, Matter);


// const camera = new Camera();

/* Alias for matter.js */
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

/* ----- Setup ------ */
/* Stage and renderer for pixi.js */
let stage, renderer;

/* Physics engine for matter.js */
let engine = Engine.create();
let stage_handler;

// Load scenes
const scenes = {
    sim: new (require(path.resolve(appPath, './src/simulation')))(),
    map: new (require(path.resolve(appPath, './src/simulation/map.js')))(),
    editor: new (require(path.resolve(appPath, './src/editor/editor.js')))()
};

require(path.resolve(appPath, './src/controls.js')); // Load in controls


function init() {
    stage_handler = new StageHandler();

    let current_scene = new Scene(
        [],
        [],
        [],
        [],
        null,
        'test-level'
    );

    // map.init();

    scenes.sim.scene = current_scene;
    stage_handler.stages = scenes;

    // sim.init();

    scenes.map.init();

    // rocket.control = true;
    // scenes.sim.addRocket(rocket);
    scenes.sim.addPlanet(earth);

    scenes.map.loadPlanetSprites();

    // Load stage and begin
    stage_handler.init();
    stage_handler.switchStage('editor');
    stage_handler.startRender();
}

module.exports = {

};
