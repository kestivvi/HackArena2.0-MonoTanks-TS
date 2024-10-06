/**
 * A simple logger class that provides colored output to the console.
 */
export declare class Log {
    /**
     * @returns A color formatted string with the provided message.
     */
    private static _coloredLog;
    /**
     * Joins the arguments into a single string.
     * @returns A string with all the arguments joined.
     */
    private static _joinArgs;
    /**
     * Logs an info message to the console.
     * @TextColor Blue
     * @BackgroundColor None
     */
    static info(...args: any[]): void;
    /**
     * Logs a connection message to the console.
     * @TextColor Magenta
     * @BackgroundColor None
     */
    static connection(...args: any[]): void;
    /**
     * Logs an error message to the console.
     * @TextColor Red
     * @BackgroundColor None
     */
    static error(...args: any[]): void;
    /**
     * Logs a warning message to the console.
     * @TextColor Yellow
     * @BackgroundColor None
     */
    static warning(...args: any[]): void;
    /**
     * Logs a debug message to the console.
     * @TextColor Black
     * @BackgroundColor Blue
     */
    static debug(...args: any[]): void;
}
