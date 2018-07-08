'use strict';

/**
 * A scene contains the current world,
 * including all sprites present
 */
class Scene {
    /**
     * constructor - Construct a new scene
     *
     * @param  {array} physical_sprites Array of physical sprites
     * @param  {array} sprites          Array of sprites
     * @param  {null} background        Currently unused
     * @param  {null} name              Currently unused
     */
    constructor(physical_sprites, sprites, background, name) {
        this.name = name;
        this.physical_sprites = physical_sprites;
        this.sprites = sprites;
    }

    /**
    * load - Loads a scene into existence.
    * Also renders the scene, and enables physics.
    *
     * @param  {PIXI.Container} stage           Stage to draw everything on
     * @param  {Matter.World} world             World to add physical objects to
     * @param  {Matter.Engine.Create()} engine  Matter.js engine
     * @return {None}
     */
    load(stage, world, engine) {
        //init.resetAll();  // Clear the game renderer and physics engine

        let bodies = [];  // Physical bodies to add to engine

        // Add physical sprites
        for(let physical_sprite of this.physical_sprites) {
            stage.addChild(physical_sprite.sprite);
            bodies.push(physical_sprite.body);
        }

        // Add non-physical sprites
        for(let sprite of this.sprites) {
            stage.addChild(sprite.sprite);
        }

        // Add all physical objects
        world.add(engine.world, bodies);
    }

    /**
     * update - Updates the current scene. Runs
     * once per game loop. Anything that needs updating
     * will be run.
     */
    update() {
        for(let physical_sprite of this.physical_sprites) {
            physical_sprite.update();
        }
    }
}


module.exports = Scene;
