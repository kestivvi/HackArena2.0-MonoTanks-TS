/**
 * Timer class to measure the time of a function or a loop
 *
 * Either use {@link start} and {@link stop} to measure time of execution of block of code or use {@link interval} to measure the time of a loop.
 */
export declare class Timer {
    private _startTime;
    private _endTime;
    private _steps;
    private _timeSum;
    constructor();
    /**
     * @returns The current time in milliseconds
     */
    private _getTime;
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
    start(): void;
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
    stop(): void;
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
    interval(): void;
    /**
     * @returns The average time in milliseconds
     */
    getAverageTime(): number;
    /**
     * @returns the duration of the timer in milliseconds
     */
    getDuration(): number;
}
