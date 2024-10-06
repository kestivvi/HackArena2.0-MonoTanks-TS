import { GameState } from "../types";
import { type MoveDirection, type Rotation } from "../types";
import type { GameEndPacket, LobbyDataPacket } from "../types";
import type { IAgent } from "./IAgent";
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
export declare abstract class Agent implements IAgent {
    private _ws;
    private _isProcessing;
    private _gameStateId;
    private _delay;
    constructor();
    /**
     * Specifies the delay in milliseconds to wait before sending the next message.
     *
     * Can be a single number (for setting exact delay) or an array of two numbers (for a random delay between the two numbers;
     * first one is the minimum, second one is the maximum).
     */
    set delay(delay: number | number[]);
    abstract on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void;
    abstract on_game_start(): void;
    abstract next_move(gameState: GameState): Promise<void>;
    abstract on_game_end(results: GameEndPacket["payload"]): void;
    /**
     * Sends a message to the server, resulting in moving the tank in the specified direction.
     * @param direction - The direction to move the tank.
     */
    protected moveTank(direction: MoveDirection): Promise<void>;
    /**
     * Sends a message to the server, resulting in taking a shot.
     */
    protected shoot(): Promise<void>;
    /**
     * Sends a pass message to the server, resulting in no action being taken.
     */
    protected pass(): Promise<void>;
    /**
     * Sends a message to the server, resulting in rotating the tank and turret.
     * @param tankRotation - The rotation of the tank.
     * @param turretRotation - The rotation of the turret.
     */
    protected rotateTank(tankRotation: Rotation | null, turretRotation: Rotation | null): Promise<void>;
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
    private _sendMessage;
    /**
     * Sends close message to the server.
     */
    private _gracefullyCloseWS;
    /**
     * Handles incoming messages from the server.
     * @param data Received data from the server
     * @param isBinary Whether the message is binary
     */
    private _onMessage;
}
