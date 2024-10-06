"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const ws_1 = __importDefault(require("ws"));
const types_1 = require("../types");
const types_2 = require("../types");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
/**
 * Base class for creating a bot. Abstracts away the WebSocket connection and provides methods for sending messages to the server.
 *
 * Extend this class and implement the abstract methods.
 *
 * @property {WebSocket} ws - The WebSocket connection to the server.
 * @property {boolean} isProcessing - Whether the bot is currently processing a game state.
 * @property {string} gameStateId - The ID of the current game state.
 * @property {number | number[]} delay - The delay in milliseconds to wait before sending the next message.
 * Can be a single number (for setting exact delay) or an array of two numbers (for a random delay between the two numbers; first one is the minimum, second one is the maximum).
 *
 */
class Agent {
    constructor() {
        this._isProcessing = false;
        this._gameStateId = "";
        this._delay = 0;
        try {
            const args = (0, utils_1.getArgs)();
            const url = (0, utils_1.getUrl)(args);
            utils_2.Log.connection("Connecting to WebSocket server...");
            this._ws = new ws_1.default(url);
            this._ws.on("close", () => {
                utils_2.Log.connection("WebSocket connection closed");
            });
            this._ws.on("error", (error) => {
                utils_2.Log.error("WebSocket error:", error.name);
                process.exit(1);
            });
            this._ws.on("message", (data, isBinary) => this._onMessage(data, isBinary));
            process.on("SIGINT", () => {
                utils_2.Log.warning("SIGINT received (Ctrl+C), shutting down...");
                this._gracefullyCloseWS();
                process.exit(0);
            });
            process.on("SIGTERM", () => {
                utils_2.Log.warning("SIGTERM received, shutting down...");
                this._gracefullyCloseWS();
                process.exit(0);
            });
        }
        catch (error) {
            utils_2.Log.error("Failed to connect to WebSocket server:", error);
            process.exit(1);
        }
    }
    /**
     * Specifies the delay in milliseconds to wait before sending the next message.
     *
     * Can be a single number (for setting exact delay) or an array of two numbers (for a random delay between the two numbers;
     * first one is the minimum, second one is the maximum).
     */
    set delay(delay) {
        if (Array.isArray(delay)) {
            if (delay.length !== 2) {
                throw new Error("Delay array must have exactly 2 elements");
            }
            if (delay[0] > delay[1]) {
                throw new Error("First element of delay array must be smaller than the second one");
            }
            if (delay[0] < 0 || delay[1] < 0) {
                throw new Error("Delay values must be positive");
            }
            if (!Number.isInteger(delay[0]) || !Number.isInteger(delay[1])) {
                throw new Error("Delay values must be integers");
            }
        }
        else {
            if (delay < 0) {
                throw new Error("Delay value must be positive");
            }
            if (!Number.isInteger(delay)) {
                throw new Error("Delay value must be an integer");
            }
        }
        this._delay = delay;
    }
    /**
     * Sends a message to the server, resulting in moving the tank in the specified direction.
     * @param direction - The direction to move the tank.
     */
    moveTank(direction) {
        const message = {
            type: types_2.PacketType.TankMovement,
            payload: {
                direction,
                gameStateId: this._gameStateId,
            },
        };
        return this._sendMessage(message);
    }
    /**
     * Sends a message to the server, resulting in taking a shot.
     */
    shoot() {
        const message = {
            type: types_2.PacketType.TankShoot,
            payload: {
                gameStateId: this._gameStateId,
            },
        };
        return this._sendMessage(message);
    }
    /**
     * Sends a pass message to the server, resulting in no action being taken.
     */
    pass() {
        const message = {
            type: types_2.PacketType.ResponsePass,
            payload: {
                gameStateId: this._gameStateId,
            },
        };
        return this._sendMessage(message);
    }
    /**
     * Sends a message to the server, resulting in rotating the tank and turret.
     * @param tankRotation - The rotation of the tank.
     * @param turretRotation - The rotation of the turret.
     */
    rotateTank(tankRotation, turretRotation) {
        if (tankRotation === null && turretRotation === null) {
            return this.pass();
        }
        const message = {
            type: types_2.PacketType.TankRotation,
            payload: {
                tankRotation,
                turretRotation,
                gameStateId: this._gameStateId,
            },
        };
        return this._sendMessage(message);
    }
    /**
     * Sends a message to the server.
     *
     * Resolves after the message is sent.
     *
     * Implements a delay before sending the message functionality.
     *
     * @param message The message to send
     * @returns A promise that resolves after the message is sent
     */
    _sendMessage(message) {
        return new Promise((resolve, _) => {
            if (this._ws.readyState === ws_1.default.OPEN) {
                this._ws.send(JSON.stringify(message), (error) => {
                    if (error) {
                        utils_2.Log.error("Failed to send message:", error);
                    }
                    else {
                        if (Array.isArray(this._delay)) {
                            const [min, max] = this._delay;
                            const delay = Math.floor(Math.random() * (max - min + 1) + min);
                            setTimeout(resolve, delay);
                        }
                        else {
                            setTimeout(resolve, this._delay);
                        }
                    }
                });
            }
            else {
                utils_2.Log.error("WebSocket connection not open, failed to send message");
            }
        });
    }
    /**
     * Sends close message to the server.
     */
    _gracefullyCloseWS() {
        if (this._ws.readyState === ws_1.default.OPEN) {
            utils_2.Log.connection("Closing WebSocket connection...");
            this._ws.close();
        }
        else {
            utils_2.Log.connection("WebSocket connection already closed");
        }
    }
    /**
     * Handles incoming messages from the server.
     * @param data Received data from the server
     * @param isBinary Whether the message is binary
     */
    _onMessage(data, isBinary) {
        if (isBinary) {
            utils_2.Log.error("Received binary data, ignoring...");
            return;
        }
        let packet;
        try {
            packet = JSON.parse(data.toString());
        }
        catch (error) {
            utils_2.Log.error("Failed to parse packet:", error);
            return;
        }
        // Handle different packet types
        switch (packet.type) {
            case types_2.PacketType.Ping: {
                const message = { type: types_2.PacketType.Pong };
                this._sendMessage(message);
                break;
            }
            case types_2.PacketType.ConnectionAccepted:
                utils_2.Log.connection("Connection to server opened");
                break;
            case types_2.PacketType.ConnectionRejected: {
                const connectionRejectedPacket = packet;
                utils_2.Log.error("Server rejected connection:", connectionRejectedPacket.payload.reason);
                this._gracefullyCloseWS();
                break;
            }
            case types_2.PacketType.LobbyData: {
                const lobbyDataPacket = packet;
                this.on_lobby_data_received(lobbyDataPacket.payload);
                break;
            }
            case types_2.PacketType.LobbyDeleted:
                utils_2.Log.info("Lobby deleted");
                this._gracefullyCloseWS();
                break;
            case types_2.PacketType.GameStart:
                if (Array.isArray(this._delay)) {
                    utils_2.Log.warning("Message delay set to random number between", this._delay[0], "and", this._delay[1], "ms");
                }
                if (typeof this._delay === "number" && this._delay > 0) {
                    utils_2.Log.warning("Message delay set to", this._delay, "ms");
                }
                this.on_game_start();
                break;
            case types_2.PacketType.GameState: {
                if (this._isProcessing) {
                    utils_2.Log.warning("Already processing game state, ignoring...");
                    return;
                }
                this._isProcessing = true;
                const gameStatePacket = packet;
                const gameState = new types_1.GameState(gameStatePacket.payload);
                this._gameStateId = gameState.gameStateId;
                this.next_move(gameState).then(() => {
                    this._isProcessing = false;
                });
                break;
            }
            case types_2.PacketType.GameEnd:
                this.on_game_end(packet.payload);
                this._gracefullyCloseWS();
                break;
            case types_2.PacketType.CustomWarning: {
                const warningMessage = packet.payload.message;
                utils_2.Log.warning("Custom warning:", warningMessage);
                break;
            }
            case types_2.PacketType.AlreadyMadeMovementWarning:
                utils_2.Log.warning("Already made movement warning");
                break;
            case types_2.PacketType.ActionIgnoredDueToDeadWarning:
                utils_2.Log.warning("Action ignored due to dead warning");
                break;
            case types_2.PacketType.SlowResponseWarningWarning:
                utils_2.Log.warning("Slow response warning");
                break;
            case types_2.PacketType.InvalidPacketTypeError:
                utils_2.Log.error("Invalid packet type error");
                break;
            case types_2.PacketType.InvalidPacketUsageError:
                utils_2.Log.error("Invalid packet usage error");
                break;
            default:
                utils_2.Log.error("Unknown packet type:", packet.type.toString());
        }
    }
}
exports.Agent = Agent;
//# sourceMappingURL=agent.js.map