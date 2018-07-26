/**
 * simulation/index.js
 * Create a new simulation object
 */

'use strict';

const Camera = require('../ui/camera.js');
const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');


class Simulation extends RenderableScene {
    constructor() {
        super();
        this.camera = new Camera();

        // Bodies
        this.planets = [];
        this.rockets = [];

        // Game
        this.engine = Engine.create();;
        this.scene = null;
        this.active_rocket = null;

        // Gamerules
        this.rules = {
            doGravity: true,
            doAirFriction: true
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
        super.init();

        this.engine.world.gravity.y = 0;                    // Disable universial downward gravity
        this.scene.load(this.stage, World, this.engine);   // Load the current scene (Add all objects)
        World.add(this.engine.world, []);                        // Init the current world

        // Start the scene
        Engine.run(this.engine);

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
            if (gameUtil.math.fastDistance(planet.position, this.rockets[0].position) < planet.radius + 10000) {
                planet.updateSector(this.rockets[0].getPos(), this);
            }
        }

        // Gravity update
        // TODO optimize with spheres of influence approximations
        // and distance approximations
        // planets should have gravitational interactions with other planets too
        //

        this.updateGravity();

        // TODO optimize checks with a cache of planets the rocket is nearby
        this.updateAirFriction();

        //this.renderer.render(this.stage);
        //requestAnimationFrame(this.update.bind(this));
    }

    /**
     * updateGravity - Update gravity calculations
     * if gravity gamerule is active
     */
    updateGravity() {
        if (this.rules.doGravity) {
            for (let planet of this.planets) {
                for (let rocket of this.rockets) {
                    planet.applyGravity(rocket);
                }
            }
        }
    }

    /**
     * updateAirFriction - Update air friction calculations
     * if game rule is active
     */
    updateAirFriction() {
        if (this.rules.doAirFriction) {
            for (let rocket of this.rockets) {
                rocket.body.airFriction = 0;

                for (let planet of this.planets) {
                    let height = gameUtil.math.distance(planet.position, rocket.position);

                    if (height <= planet.radius + planet.atmosphere.height) {
                        rocket.body.airFriction = planet.atmosphere.getDrag(height);
                        break;
                    }
                }
            }
        }
    }

    /**
     * resetAll - Resets the World, engine, stage
     * and renderer to default values.
     */
    resetAll(){
        // Clear any previous worlds and renderers
        // if (World && engine)
        //    World.clear();

        super.resetAll();
        this.engine = Engine.create();
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
