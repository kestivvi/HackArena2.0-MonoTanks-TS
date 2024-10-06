"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const types_1 = require("../types");
/**
 * A simple logger class that provides colored output to the console.
 */
class Log {
    /**
     * @returns A color formatted string with the provided message.
     */
    static _coloredLog(message, color, background) {
        return `\x1b[${background ?? ""};${color}m${message}\x1b[0m`;
    }
    /**
     * Joins the arguments into a single string.
     * @returns A string with all the arguments joined.
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static _joinArgs(args) {
        return args
            .map((arg) => {
            if (Array.isArray(arg)) {
                return JSON.stringify(arg);
            }
            if (arg instanceof Error) {
                return `\n${arg.stack}`;
            }
            if (typeof arg === "object") {
                return JSON.stringify(arg, null, 0);
            }
            return arg;
        })
            .join(" ");
    }
    /**
     * Logs an info message to the console.
     * @TextColor Blue
     * @BackgroundColor None
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static info(...args) {
        console.log(Log._coloredLog(`[INFO] ${Log._joinArgs(args)}`, types_1.TextColor.Blue));
    }
    /**
     * Logs a connection message to the console.
     * @TextColor Magenta
     * @BackgroundColor None
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static connection(...args) {
        console.log(Log._coloredLog(`[CONNECTION] ${Log._joinArgs(args)}`, types_1.TextColor.Magenta));
    }
    /**
     * Logs an error message to the console.
     * @TextColor Red
     * @BackgroundColor None
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static error(...args) {
        console.log(Log._coloredLog(`[ERROR] ${Log._joinArgs(args)}`, types_1.TextColor.Red));
    }
    /**
     * Logs a warning message to the console.
     * @TextColor Yellow
     * @BackgroundColor None
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static warning(...args) {
        console.log(Log._coloredLog(`[WARNING] ${Log._joinArgs(args)}`, types_1.TextColor.Yellow));
    }
    /**
     * Logs a debug message to the console.
     * @TextColor Black
     * @BackgroundColor Blue
     */
    // biome-ignore lint/suspicious/noExplicitAny: Avoiding TypeScript type checking for the sake of simplicity.
    static debug(...args) {
        console.log(Log._coloredLog(`[DEBUG] ${Log._joinArgs(args)}`, types_1.TextColor.Black, types_1.TextBackground.White));
    }
}
exports.Log = Log;
//# sourceMappingURL=logger.js.map