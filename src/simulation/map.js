/**
 * In-game map display
 */

'use strict';

const Camera = require('../ui/camera.js');
const RenderableScene = require('../ui/renderable-scene.js');
const gameUtil = require('../util.js');

const DEFAULT_MAP_ZOOM = 1000; // Map is 1000x smaller than sim initially

class Map extends RenderableScene {
    /**
     * constructor - Construct a new map
     * object (No arguments)
     */
    constructor() {
        super();
        this.camera = new Camera;
        this.focus = { x: 0, y: 0 };
    }

    /**
     * loadPlanetSprites - Fills this.planet_sprites using
     * planet data from sim.planets. Use after all planets
     * have been added to sim.planets
     */
    loadPlanetSprites() {
        for (let planet of sim.planets) {
            let sprite = new PIXI.Sprite.fromImage(planet.image);
            sprite.width = planet.radius / DEFAULT_MAP_ZOOM;
            sprite.height = planet.radius / DEFAULT_MAP_ZOOM;
            sprite.anchor.set(0.5, 0.5);

            planet.map_sprite = sprite;
            this.stage.addChild(sprite);
        }
    }

    /**
     * update - Run the update loop -
     * updates map graphics from simulation
     */
    update() {
        this.camera.focusOn(this.focus);
        this.camera.updateScene(this.stage, this.renderer);

        for (let planet of sim.planets) {
            planet.map_sprite.x = planet.position.x / DEFAULT_MAP_ZOOM;
            planet.map_sprite.y = planet.position.y / DEFAULT_MAP_ZOOM;
        }

        // this.renderer.render(this.stage);
        // requestAnimationFrame(this.update.bind(this));
    }
}

module.exports = Map;
