# New Frontier File Structure and Guidelines
This document outlines the general file structure of the project. You should follow here if you need to find or add something. **If you create a new folder or change the file structure please edit this file!**

## assets
---
This folder contains game assets (images, sounds, etc...) If you wish to modify or add an image, just see the existing images and use them as a template. It should be structured as follows:

### dev
Put any testing or template files in here. The game should NOT load anything from this folder.

### img
#### biomes
`[biome_name].png`    Biome ground texture (Seamless square PNG image)
#### parts    
Each subfolder contains `[part_name].png`
(Subfolders not listed - they correspond to part category, which a list of which can be found in `src/game/rocket-parts/all-parts.js`)

#### planets
`[planet_name].png`   Round PNG image of the planet (For map display).

### sounds
#### music
All music files go here

#### effects
All sound effect files go here

## docs
---
Contains a bunch of markdown files and images that document the game

## public
---
Because the game is basically displayed as a canvas in an electron instance, this is the "website" part that is rendered.

### css
Contains only `index.css` at the moment.

### js
Contains all the files for `PIXI.js` and `Matter.js`

### index.html
Main game. See `index.html` for comments regarding classes and structure.

## src
---
Contains the main source of the game. Non-test javascript game code should go here.

`init.js` Core game logic
`util.js` Util functions
`controls.js` Handle game input from keyboard/mouse

### components
Any "base classes" or components used by the game. Currently acts like a "misc" folder for classes that are too general to belong anywhere, but play an important foundational role. Currently only holds 2 classes, `ImageSprite` and `PhysicalSprite`

### editor
Any code pretaining to the ship editor belongs here.
`editor_html.js` Contains the HTML code that is rendered on top of the canvas (GUI)
`editor.js` Contains editor logic and interaction.

### game
Main game code. Contains classes and other code (main game logic). Mostly only **defines classes**, not **use classes**

`biomes.js` Biome config file
`config.js` Game config file
`conversion.js`  Unit conversion (Ie meter to pixels, kg to matter.js mass, etc...)
`rocket.js`  Rocket class for assembled rocket

#### bodies
JS files containing classes for bodies (Such as Earth, the Sun, etc...). See the tutorial for creating a planet in `/docs`

#### rocket-parts
See the tutorial for creating rocket parts in `/docs`

`all-parts.js` Loads all rocket parts when required for the first time, and contains information pretaining to rocket parts. Here are the module.exports

```javascript
module.exports = {
    /* An array of all rocket parts. Since rocket parts are "classes",
       each part is constructed. For example, if you have a part called
       Thruster, the parts array will contain new Thruster()
    */
    parts: ALL_PARTS,  

    /*
       An array of all rocket part categories, in title-case. For example,
       "Thruster" or "Fuel"
     */
    categories: CATEGORIES,

    /*
    Array of informational data for each part. Each item looks like this:
    {
        data: t.data,   // Data object in part class
        id: t.id,       // ID defined in the part class
        image_path: t.image_path  // Path to image of the part
    }
    */
    parts_data: parts_data
};
```

##### base-classes
"Base" type objects that have multiple parts that inherit properties (Ie generic fuel tank, generic thruster). **THIS FOLDER IS IGNORED WHEN AUTOMATICALLY ADDING PARTS**

##### command, fuel, thruster, etc...
These folders contain each part class, and files are automatically imported when the game is launched. Folder name should match part category list in `/src/game/rocket-parts/all_parts.js`

---
### game-components
Classes that are used as base classes/non-obvious uses (such as graphics).
`planet-sector-graphic.js` Graphical sector
`planet-sector.js` Collidable sector
`rocket-part.js` All rocket parts inherit this
`physical-scene.js` A scene that contains PhysicalSprites and Matter.js bodies

#### bodies 
Classes for different types of celestial bodies
`planet.js`  Planet class (Every planet inherits this)

---
### simulation
Currently only contains `index.js` and `map.js`, 2 scenes displayed in the "simulation" portion of the game

---
### ui
User interface classes

`camera.js` Camera for PIXI.js
`renderable-scene.js` A scene you can switch to/from
`stage-handler.js`  Handles switching between scenes/stages

#### gui-unused
Currently unused GUI components
