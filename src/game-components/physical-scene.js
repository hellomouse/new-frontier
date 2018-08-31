'use strict';

/**
 * A PhysicalScene contains the current world,
 * including all sprites present
 */
class PhysicalScene {
    /**
     * @constructor - Construct a new PhysicalScene
     *
     * @param  {array} physicalSprites - Array of physical sprites
     * @param  {array} sprites - Array of sprites
     * @param  {array} bodies - Array of bodies
     * @param  {array} updatable - Array of updatable objects
     * @param  {*} background - Currently unused
     * @param  {*} name - Currently unused
     */
    constructor(physicalSprites, sprites, bodies, updatable, background, name) {
        this.name = name;
        this.physicalSprites = physicalSprites;
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
     */
    load(stage, world, engine) {
        // init.resetAll();  // Clear the game renderer and physics engine

        // Add physical sprites
        this.addPhysicalSprites(stage, this.physicalSprites);

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
     * @param  {array} sprites Array of physical sprites
     */
    addPhysicalSprites(stage, sprites) {
        for (let physicalSprite of sprites) {
            stage.addChild(physicalSprite.sprite);
            if (!physicalSprite.skip_add_body) {
                this.bodies.push(physicalSprite.body);
            }
        }
        this.physicalSprites = this.physicalSprites.concat(sprites);
    }

    /**
     * update - Updates the current PhysicalScene. Runs
     * once per game loop. Anything that needs updating
     * will be run.
     */
    update() {
        for (let physicalSprite of this.physicalSprites) {
            physicalSprite.update();
        }

        for (let updatable of this.updatable) {
            updatable.update();
        }
    }
}


module.exports = PhysicalScene;
