"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
/**
 * Timer class to measure the time of a function or a loop
 *
 * Either use {@link start} and {@link stop} to measure time of execution of block of code or use {@link interval} to measure the time of a loop.
 */
class Timer {
    constructor() {
        this._startTime = 0;
        this._endTime = 0;
        this._steps = 0;
        this._timeSum = 0;
    }
    /**
     * @returns The current time in milliseconds
     */
    _getTime() {
        return new Date().getTime();
    }
    /**
     * Starts the timer
     *
     * @example
     * ```typescript
     * const timer = new Timer();
     * timer.start();
     * HeavyDutyStaff();
     * timer.stop();
     *
     * ```
     */
    start() {
        this._startTime = this._getTime();
    }
    /**
     * Stops the timer
     *
     * @example
     * ```typescript
     * const timer = new Timer();
     * timer.start();
     * HeavyDutyStaff();
     * timer.stop();
     *
     * ```
     */
    stop() {
        this._endTime = this._getTime();
        this._timeSum += this.getDuration();
        this._steps++;
    }
    /**
     * Resets the timer, saving the current time as the start time
     *
     * Call this function in a loop to get timings for each iteration.
     * Than use {@link getAverageTime} to get the average time.
     *
     * @example
     * ```typescript
     * const timer = new Timer();
     * for (let i = 0; i < 10; i++) {
     *    timer.interval();
     *   // do something
     * }
     * console.log(timer.getAverageTime());
     * ```
     *
     */
    interval() {
        if (this._startTime === 0) {
            this.start();
        }
        this.stop();
        this.start();
    }
    /**
     * @returns The average time in milliseconds
     */
    getAverageTime() {
        return this._timeSum / this._steps;
    }
    /**
     * @returns the duration of the timer in milliseconds
     */
    getDuration() {
        return this._endTime - this._startTime;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=timer.js.map