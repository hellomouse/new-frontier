'use strict';

/**
 * A PhysicalScene contains the current world,
 * including all sprites present
 */
class PhysicalScene {
    /**
     * constructor - Construct a new PhysicalScene
     *
     * @param  {array} physical_sprites Array of physical sprites
     * @param  {array} sprites          Array of sprites
     * @param  {null} background        Currently unused
     * @param  {null} name              Currently unused
     */
    constructor(physical_sprites, sprites, bodies, updatable, background, name) {
        this.name = name;
        this.physical_sprites = physical_sprites;
        this.sprites = sprites;
        this.bodies = bodies;
        this.updatable = updatable;
    }

    /**
     * load - Loads a PhysicalScene into existence.
     * Also renders the PhysicalScene, and enables physics.
     *
     * @param  {PIXI.Container} stage           Stage to draw everything on
     * @param  {Matter.World} world             World to add physical objects to
     * @param  {Matter.Engine.Create()} engine  Matter.js engine
     * @return {None}
     */
    load(stage, world, engine) {
        // init.resetAll();  // Clear the game renderer and physics engine

        // Add physical sprites
        this.addPhysicalSprites(stage, this.physical_sprites);

        // Add non-physical sprites
        for (let sprite of this.sprites) {
            stage.addChild(sprite.sprite);
        }

        // Add all physical objects
        world.add(engine.world, this.bodies);
    }

    /**
     * addPhysicalSprites - Adds more physical sprites
     * to the current scene.
     *
     * @param  {PIXI.Container} stage   Stage to draw everything on
     * @param  {array} physical_sprites Array of physical sprites
     */
    addPhysicalSprites(stage, sprites) {
        for (let physical_sprite of sprites) {
            stage.addChild(physical_sprite.sprite);
            if (!physical_sprite.skip_add_body) {
                this.bodies.push(physical_sprite.body);
            }
        }
        this.physical_sprites = this.physical_sprites.concat(sprites);
    }

    /**
     * update - Updates the current PhysicalScene. Runs
     * once per game loop. Anything that needs updating
     * will be run.
     */
    update() {
        for (let physical_sprite of this.physical_sprites) {
            physical_sprite.update();
        }

        for (let updatable of this.updatable) {
            updatable.update();
        }
    }
}


module.exports = PhysicalScene;
