/**
 * simulation/index.js
 * Create a new simulation object
 */

'use strict';

const Camera = require('../ui/camera.js');
const gameUtil = require('../util.js');


class Simulation {
    constructor() {
        this.camera = new Camera;

        // Bodies
        this.planets = [];
        this.rockets = [];

        // Game
        this.stage = null;
        this.renderer = null;
        this.engine = Engine.create();;
        this.scene = null;
        this.active_rocket = null;

        // Gamerules
        this.rules = {
            doGravity: true
        };
    }


    /**
     * addPlanet - Add a new planet to the simulation.
     * This method is recommended to be used in case
     * of edits in the future.
     *
     * @param  {Planet} planet Planet obj to add.
     */
    addPlanet(planet) {
        this.planets.push(planet);
    }

    /**
     * addRocket - Add a new rocket to the simulation.
     * DO NOT DIRECTLY EDIT this.rockets
     *
     * @param  {Rocket} rocket Rocket obj to add
     */
    addRocket(rocket) {
        // Add to this.scene for tracking
        this.scene.bodies.push(rocket.body);
        this.scene.updatable.push(rocket);

        // Add body to the world
        World.add(this.engine.world, rocket.body);

        // Add to internal array
        this.rockets.push(rocket);
    }

    /**
     * init - Init the simulation. Sets up some
     * instance variables and starts running the
     * main loop
     */
    init() {
        this.resetAll();

        this.engine.world.gravity.y = 0;                    // Disable universial downward gravity
        this.scene.load(this.stage, World, this.engine);   // Load the current scene (Add all objects)
        World.add(this.engine.world, []);                        // Init the current world

        // Start the scene
        Engine.run(this.engine);
        this.renderer.render(this.stage);
        requestAnimationFrame(this.update.bind(this));

        // Add all the planets
        for (let planet of this.planets) {
            planet.addToStage(PIXI, this.stage);
        }
    }

    /**
     * update - Run the main game loop for
     * the simulation
     */
    update() {
        // Scene update
        this.scene.update();

        // Camera update
        if (this.getActiveRocket() !== null) {
            this.camera.focusOn(this.getActiveRocket().getPos());
            this.camera.updateScene(this.stage, this.renderer);
        }

        // Sector uodate
        for (let planet of this.planets) {
            //TODO maybe optimize with a cache of distances and stuff

            // 1.5 is a "close enough" to start adding the planet's land collision box
            if (gameUtil.math.fastDistance(planet.position, this.rockets[0].position) < planet.radius * 1.5) {
                planet.updateSector(this.rockets[0].getPos(), this);
            }
        }

        // Gravity update
        // TODO optimize with spheres of influence approximations
        // and distance approximations
        // planets should have gravitational interactions with other planets too

        if (this.rules.doGravity) {
            for (let planet of this.planets) {
                for (let rocket of this.rockets) {
                    let x1 = planet.position.x;
                    let y1 = planet.position.y;
                    let x2 = rocket.position.x;
                    let y2 = rocket.position.y;

                    let f_mag = config.G_CONSTANT * planet.mass * rocket.body.mass / ((x1 - x2) ** 2 + (y1 - y2) ** 2);
                    let angle = Math.atan2(y1 - y2, x1 - x2);

                    let vector = {x: f_mag * Math.cos(angle), y: f_mag * Math.sin(angle)};
                    Matter.Body.applyForce(rocket.body, rocket.position, vector);
                }
            }
        }

        this.renderer.render(this.stage);
        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * resetAll - Resets the World, engine, stage
     * and renderer to default values.
     */
    resetAll(){
        // Clear any previous worlds and renderers
        // if (World && engine)
        //    World.clear();

        this.engine = Engine.create();
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer(
            window.innerWidth,
            window.innerHeight,
            { view: document.getElementById('canvas') }
        );
    }

    /**
     * getActiveRocket - Return the current controllable rocket
     * that's selected, or null if none are on screen. ALso updates
     * this.active_rocket to be the present active rocket
     *
     * @return {Rocket}  Current active rocket.
     */
    getActiveRocket() {
        if (this.active_rocket === null || this.active_rocket.control === false) {
            for (let rocket of this.rockets) {
                if (rocket.control === true) {
                    this.active_rocket = rocket;
                    return rocket;
                }
            }
            return null;
        }
        return this.active_rocket;
    }

    toJSON() {
        // Nothing yet
    }

    loadFromJSON(json) {
        // Nothing yet
    }
}

module.exports = Simulation;
