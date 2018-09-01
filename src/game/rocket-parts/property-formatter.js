'use strict';

/**
 * Format:
 * KEY: property_name - name of the variable, NOT the display name
 *
 * PROPERTIES:
 * display_name - formatted name to display
 * unit - string for the unit (ie 'N' or ''). Recommended to use the
 *        units defined in /src/game/units.js
 * display=true - (boolean) should it display the property?
 *
 * See examples below
 */

const units = require('../units.js');

let properties = {
    max_thrust_atm: {
        display_name: 'Max Thrust (atm)',
        unit: units.force[0]
    },
    max_thrust_vac: {
        display_name: 'Max Thrust (vac)',
        unit: units.force[0]
    },
    fuel_consumption: {
        display_name: 'Max Fuel Consumption',
        unit: units.volume[0] + '/' + units.time[0]
    },
    isp: {
        display_name: 'ISP (Efficency)',
        unit: units.time[0]
    },
    gimble: {
        display: false
    },
    heat_generation: {
        display_name: 'Heat Generation',
        unit: units.temperature[0] + '/' + units.time[0]
    }
};

for (let property of Object.keys(properties)) {
    if (properties[property].display === undefined)
        properties[property].display = true;
}

module.exports = properties;
