'use strict';

module.exports = {
    large_number: Number.MAX_SAFE_INTEGER,
    math: {
        /**
         * fastAtan - Fast atan approximation. About
         * 2x faster than native atan, for slightly
         * less accuracy.
         *
         * @param  {number} x Ratio
         * @return {number}   Angle, in rad
         */
        fastAtan (x) {
            return (3.14159265 / 4) * x - x * (Math.abs(x) - 1) * (0.2447 + 0.0663 * Math.abs(x));
        },

        /**
         * fastDistance - Fast distance approximation,
         * given 2 position vectors. No clue how it works,
         * but it's nearly 6x faster
         *
         * @param  {Vector} pos1 {x: number, y: number}
         * @param  {Vector} pos2 {x: number, y: number}
         * @return {number}      Distance (2D)
         */
        fastDistance (pos1, pos2) {
            let approx;
            let dx = Math.abs(pos1.x - pos2.x);
            let dy = Math.abs(pos1.y - pos2.y);

            let [min, max] = dx < dy ? [dx, dy] : [dy, dx];

            approx = max * 1007 + min * 441;
            if (max < min << 4) {
               approx -= max * 40;
           }
            return (approx + 512) >> 10;
        },

        /**
         * distance - Naive distance algorithim
         * between 2 position vectors
         *
         * @param  {Vector} pos1 {x: number, y: number}
         * @param  {Vector} pos2 {x: number, y: number}
         * @return {number}      Distance (2D)
         */
        distance (pos1, pos2) {
            return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
        },

        /**
         * copySign - Return a number, either 1
         * or -1, that matches the sign of the number
         *
         * @param  {number} number Number to check
         * @return {number}        -1 or 1
         */
        copySign (number) {
            return number < 0 ? -1 : 1;
        },

        /**
         * degToRad - Convert degrees to radian
         *
         * @param  {number} deg Degree
         * @return {number}     Radian
         */
        degToRad (deg) {
            return deg / 180 * Math.PI;
        },

        /**
         * radToDeg - Convert radian to degrees
         *
         * @param  {number} rad Radian
         * @return {number}     Degree
         */
        radToDeg (rad) {
            return rad / Math.PI * 180;
        },

        /**
         * isBetween - Is x between a and b, inclusive?
         *
         * @param  {number} x Number to compare
         * @param  {number} a Low bound
         * @param  {number} b High bound
         * @return {boolean}  Is it between?
         */
        isBetween (x, a, b) {
            return a <= x && x <= b;
        },

        /**
         * isAngleBetween - Is an angle between
         * 2 boundaries, inclusive?
         *
         * @param  {number} x Number to compare
         * @param  {number} a Low bound (Degrees)
         * @param  {number} b High bound (Degrees)
         * @return {boolean}  Is it between?
         */
        isAngleBetween (x, a, b) {
            return this.isBetween(this.radToDeg(x), a, b);
        },

        /**
         * rectIntersect - Do 2 rectangles intersect
         * each other?
         *
         * @param  {number} x1 Top left corner rect 1 x
         * @param  {number} y1 Top left corner rect 1 y
         * @param  {number} x2 Bottom right corner rect 1 x
         * @param  {number} y2 Bottom right corner rect 1 y
         * @param  {number} x3 Top left corner rect 2 x
         * @param  {number} y3 Top left corner rect 2 y
         * @param  {number} x4 Bottom right corner rect 2 x
         * @param  {number} y4 Bottom right corner rect 2 y
         * @param  {boolean} s Strict?
         * @return {boolean}   Intersects?
         */
        rectIntersect(x1, y1, x2, y2, x3, y3, x4, y4, s=true) {
            if (s) return !(x3 > x2 || x4 < x1 || y3 > y2 || y4 < y1);
            return !(x3 >= x2 || x4 <= x1 || y3 >= y2 || y4 <= y1);
        },

        /**
         * getSign - Returns -1 or 1, depending
         * on the sign of the number (-1 if negative)
         *
         * @param  {number} n A number
         * @return {number}   1 * sign of the number
         */
        copySign(n) {
            return n < 0 ? -1 : 1;
        },

        /**
         * quadCos - For an angle that is a multiple of 90
         * degrees returns exact cos value (-1, 0 or 1)
         *
         * @param  {number} angle Angle in rad between 0 and 2 * PI
         * @return {number}       COS angle
         */
        quadCos(angle) {
            if (Math.abs(angle - 0) < 0.1) return 1;
            if (Math.abs(angle - Math.PI / 2) < 0.1) return 0;
            if (Math.abs(angle - 3 * Math.PI / 2) < 0.1) return 0;
            if (Math.abs(angle - Math.PI) < 0.1) return -1;
            if (Math.abs(angle - Math.PI * 2) < 0.1) return 1;
        },

        /**
         * quadSin - For an angle that is a multiple of 90
         * degrees returns exact sin value (-1, 0 or 1)
         *
         * @param  {number} angle Angle in rad between 0 and 2 * PI
         * @return {number}       SIN angle
         */
        quadSin(angle) {
            if (Math.abs(angle - 0) < 0.1) return 0;
            if (Math.abs(angle - Math.PI / 2) < 0.1) return 1;
            if (Math.abs(angle - 3 * Math.PI / 2) < 0.1) return -1;
            if (Math.abs(angle - Math.PI) < 0.1) return 0;
            if (Math.abs(angle - Math.PI * 2) < 0.1) return 0;
        },

        /**
         * normalizeAngle - Given a radian angle, normalizes
         * it to be between 0 and 2 PI
         *
         * @param  {number} angle Angle in rad
         * @return {number}       Coterminal angle in rad between 0 and 2 * PI
         */
        normalizeAngle(angle) {
            while (angle < 0) angle += Math.PI * 2;
            while (angle >= Math.PI * 2) angle -= Math.PI * 2;
            return angle;
        },

        /**
         * isBetween - Is x between a and b
         *
         * @param  {number} x Variable to check
         * @param  {number} a Bound 1 - Not necessarily lower
         * @param  {number} b Bound 2 - Not necessarily lower
         * @return {boolean}  Is it between
         */
        isBetween(x, a, b) {
            let bounds = [a, b].sort((a, b) => a - b);
            return bounds[0] < x && x < bounds[1];
        }
    },

    controls: {
        /**
         * WASDToDxDy - Convert WASD and arrow keys
         * to a dx dy direction
         *
         * @param  {number} x_inc   X increment per key press
         * @param  {number} y_inc   Y increment per key press
         * @param  {string} keyname Name of key pressed from keyboard-key
         * @return {object}         {dx, dy}
         */
        WASDToDxDy (x_inc, y_inc, keyname) {
            let [dx, dy] = [0, 0];

            /* Set dx or dy to a positive value, depends if it's horz or vertical mvoement */
            if (['a', 'd', 'ArrowLeft', 'ArrowRight'].includes(keyname)) dx = x_inc;
            else dy = y_inc;

            /* These go in "opposite" negative directions */
            if (['a', 'ArrowLeft', 'w', 'ArrowUp'].includes(keyname)) {
                dx *= -1;
                dy *= -1;
            }

            return {dx, dy};
        }
    }
};
