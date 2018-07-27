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
const Simulation = require(path.resolve(appPath, './src/simulation'));
const MapView = require(path.resolve(appPath, './src/simulation/map.js'));
const StageHandler = require(path.resolve(appPath, './src/ui/stage-handler.js'));


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

let earth = new Earth(0, 0);
earth.position.y = earth.radius * Math.sin(50 / 180 * Math.PI) + 3000;
earth.position.x = earth.radius * Math.cos(50 / 180 * Math.PI);
let rocket = new Rocket(blocks, Matter);


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

let sim = new Simulation();
let map = new MapView();
let stage_handler;

require(path.resolve(appPath, './src/controls.js')); // Load in controls


function init() {
    stage_handler = new StageHandler();

    let current_scene = new Scene(
        blocks,
        [],
        [],
        [],
        null,
        'test-level'
    );

    // map.init();

    sim.scene = current_scene;

    stage_handler.stages['map'] = map;
    stage_handler.stages['sim'] = sim;

    // sim.init();

    map.init();

    rocket.control = true;
    sim.addRocket(rocket);
    sim.addPlanet(earth);

    map.loadPlanetSprites();
    stage_handler.init();
    stage_handler.startRender();
}





module.exports = {

};
