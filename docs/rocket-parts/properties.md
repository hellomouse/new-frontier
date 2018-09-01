# Rocket Part Properties

Rocket part properties are things (variables) that are unique to a part or a type of part. For example, fuel tanks might have a "fuel-amount" property, while a thruster might have a "max-thrust" property. Here's how to define a property(ies) for your part. Unlike `this.data`, this variable is/can be UNIQUE depending on the part.

## Example
This is an example part. It is a thruster. We'll configure the properties. There are 2 types:

This thruster has **(static) properties** that can't be changed by the player such as
- Max Thrust
- ISP (efficency)
- Fuel consumption
etc... (See `src/game/rocket-parts/base-classes/thruster.js` for a full modifiable list, this is just an example)

And **(dynamic) properties** that can be modified by the player in-game such as
- On/off state
- Thrust limiter

Alright, let's get started

```javascript
this.properties = {
    'static': {
        max_thrust: 1,
        fuel_consumption: 0.5,
        isp: 1 / 0.5  /* Thrust / Fuel consumption */
    },
    dynamic: {
        state: {
            label: 'On/Off',
            type: 'toggle',
            value: false  /* Default value, this CAN change */
        },
        thrust_limiter: {
            label: 'Thrust Limiter',
            type: 'range',
            range: [0, 100],
            value: 100    /* Default value, this CAN change */
        }
    },
};
```

## Docs
Ok let's begin a more thorough explaination of the above.

*TIP: If your property is a reserved keyword, use a string*

### static
Each static variable you want is just a key in `properties.static`, as you can see in the example above. In your code, just simply reference `this.properties.static.<var name>` as you would an instance variable.

To keep variables consistent and reduce unecessary repetition, if you introduce a new static property, you might need to add it to `/src/game/rocket-parts/property-formatter.js`.

### dynamic
This is a bit more complex. Here is the general structure of a dynamic variable, each item below is a key in the object. (All dynamic variables are objects)

#### Required properties
**label** - A short string describing your control, such as "On/off". Displays in-game.

**type** - The type of control that the player can use to modify the variable. Here are your choices. Some controls require you to include more properties to act as options.

- **text** - Not exactly a control. Simply displays the variable's value as a label, useful for science instruments for displaying readings, such as temperature.
- **toggle** - A on/off toggle.
- **range** - A number slider range. Slide to choose a nmber between 2 ranges. Requires the property **range** which is just an array formatted like `[min_value, max_value]` (Inclusive)
- **dropdown** - A dropdown menu of choices. Requires the property **options** which is an array of strings of your choices, such as `['Option A', 'Option B', 'Option C']`

**value** - This stores the current value of the dynamic variable. For example, if you want to check if your solar panel is on, you might access `this.properties.dynamic.onoff.value`. The starting value is the DEFAULT and is **REQUIRED**

#### Optional Properties
**disabled** - If this property is true, the control will not be usable. Default: false
