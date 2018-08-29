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
         * distance - Naive distance algorithim
         * between 2 position vectors
         *
         * @param  {Vector} pos1 {x: number, y: number}
         * @param  {Vector} pos2 {x: number, y: number}
         * @return {number}      Distance (2D)
         */
        distance(pos1, pos2) {
            return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
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
        },

        /**
         * degToRad - Convert degrees to radian
         *
         * @param  {number} deg Degree
         * @return {number}     Radian
         */
        degToRad(deg) {
            return deg / 180 * Math.PI;
        },

        /**
         * radToDeg - Convert radian to degrees
         *
         * @param  {number} rad Radian
         * @return {number}     Degree
         */
        radToDeg(rad) {
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
        isBetween(x, a, b) {
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
        isAngleBetween(x, a, b) {
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
         * @return {boolean}   Intersects?
         */
        rectIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
            return !(x3 > x2 || x4 < x1 || y3 > y2 || y4 < y1);
        }
    }
};
