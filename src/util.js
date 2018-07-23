'use strict';

module.exports = {
    math: {
        /**
         * fastAtan - Fast atan approximation. About
         * 2x faster than native atan, for slightly
         * less accuracy.
         *
         * @param  {number} x Ratio
         * @return {number}   Angle, in rad
         */
        fastAtan(x) {
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
        fastDistance(pos1, pos2) {
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
         * copySign - Return a number, either 1
         * or -1, that matches the sign of the number
         *
         * @param  {number} number Number to check
         * @return {number}        -1 or 1
         */
        copySign(number) {
            return number < 0 ? -1 : 1;
        }
    }
};
