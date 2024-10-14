/**
 * Enum for the different types of packets that can be sent between the server and the client.
 *
 * The packet type is encoded as follows:
 * - 4 most significant bits represent the group of the packet - xxxx 0000
 * - 4th least significant bit determines if the packet has a payload - 0000 x000
 * - 3 least significant bits represent the type of the packet - 0000 0xxx
 */
declare enum PacketType {
    Unknown = 0,
    HasPayload = 8,
    CommunicationGroup = 16,
    Ping = 17,
    Pong = 18,
    ConnectionAccepted = 19,
    ConnectionRejected = 28,
    LobbyGroup = 32,
    LobbyData = 41,
    LobbyDeleted = 34,
    GameStateGroup = 48,
    GameStart = 49,
    GameState = 58,
    GameEnd = 59,
    PlayerResponseGroup = 64,
    Movement = 73,
    Rotation = 74,
    AbilityUse = 75,
    Pass = 79,
    WarningGroup = 224,
    CustomWarning = 233,
    AlreadyMadeMovementWarning = 226,
    ActionIgnoredDueToDeadWarning = 227,
    SlowResponseWarningWarning = 228,
    ErrorGroup = 240,
    InvalidPacketTypeError = 241,
    InvalidPacketUsageError = 242
}
declare enum Direction {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3
}
declare enum MoveDirection {
    Forward = 0,
    Backward = 1
}
declare enum Rotation {
    Left = 0,
    Right = 1
}
declare enum AbilityType {
    FireBullet = 0,
    UseLaser = 1,
    FireDoubleBullet = 2,
    UseRadar = 3,
    DropMine = 4
}
declare enum ZoneStatusTypes {
    Neutral = "neutral",
    BeingCaptured = "beingCaptured",
    Captured = "captured",
    BeingContested = "beingContested",
    BeingRetaken = "beingRetaken"
}
declare enum TextColor {
    Black = 30,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Magenta = 35,
    Cyan = 36,
    White = 37
}
declare enum TextBackground {
    Black = 40,
    Red = 41,
    Green = 42,
    Yellow = 43,
    Blue = 44,
    Magenta = 45,
    Cyan = 46,
    White = 47
}
declare enum TileTypes {
    Empty = "empty",
    Wall = "wall",
    Bullet = "bullet",
    Tank = "tank",
    Item = "item",
    Laser = "laser",
    Mine = "mine"
}
declare enum BulletType {
    Bullet = "basic",
    DoubleBullet = "double"
}
declare enum ItemTypes {
    Unknown = 0,
    Laser = 1,
    DoubleBullet = 2,
    Radar = 3,
    Mine = 4
}
declare enum LaserOrientation {
    Horizontal = 0,
    Vertical = 1
}

/**
 * Base interface for all packets.
 */
interface Packet {
    type: PacketType;
}
type PongPacket = Packet & {
    type: PacketType.Pong;
};
type LobbyDataPlayer = {
    id: string;
    nickname: string;
    color: number;
};
type ServerSettings = {
    gridDimension: number;
    numberOfPlayers: number;
    seed: number;
    ticks: number;
    broadcastInterval: number;
    eagerBroadcast: boolean;
};
type LobbyDataPacket = Packet & {
    type: PacketType.LobbyData;
    payload: {
        playerId: string;
        players: LobbyDataPlayer[];
        serverSettings: ServerSettings;
    };
};
type Bullet = TileItem & {
    type: TileTypes.Bullet;
    payload: {
        id: number;
        speed: number;
        direction: number;
        type: BulletType;
    };
};
type Empty = TileItem & {
    type: TileTypes.Empty;
};
type Wall = TileItem & {
    type: TileTypes.Wall;
};
type Turret = {
    direction: Direction;
    bulletCount?: number;
    ticksToRegenBullet?: number | null;
};
type Tank = TileItem & {
    type: TileTypes.Tank;
    payload: {
        ownerId: string;
        direction: Direction;
        turret: Turret;
        health?: number;
        secondaryItem: ItemTypes;
    };
};
type Item = TileItem & {
    type: TileTypes.Item;
    payload: {
        type: ItemTypes;
    };
};
type Laser = TileItem & {
    type: TileTypes.Laser;
    payload: {
        id: number;
        orientation: LaserOrientation;
    };
};
type Mine = TileItem & {
    type: TileTypes.Mine;
    payload: {
        id: number;
        explosionRemainingTicks: number | null;
    };
};
type TileItem = {
    type: TileTypes;
    payload?: object;
};
type MapBlock = Array<Empty | Wall | Bullet | Tank | Item | Laser | Mine>;
type GameStatePlayer = {
    id: string;
    nickname: string;
    color: number;
    ping: number;
    score?: number;
    ticksToRegen?: number | null;
    isUsingRadar: boolean;
};
type ZoneStatus = {
    type: ZoneStatusTypes.Neutral;
} | {
    type: ZoneStatusTypes.BeingCaptured;
    remainingTicks: number;
    playerId: string;
} | {
    type: ZoneStatusTypes.Captured;
    playerId: string;
} | {
    type: ZoneStatusTypes.BeingContested;
    capturedById: string | null;
} | {
    type: ZoneStatusTypes.BeingRetaken;
    remainingTicks: number;
    capturedById: string;
    retakenById: string;
};
type Zone = {
    x: number;
    y: number;
    width: number;
    height: number;
    index: string;
    status: ZoneStatus;
};
type GameStatePacket = Packet & {
    type: PacketType.GameState;
    payload: {
        id: string;
        tick: number;
        players: GameStatePlayer[];
        map: {
            tiles: TileItem[][][] | [][][];
            zones: Zone[];
            visibility: string[];
        };
    };
};
type GameEndPacket = Packet & {
    type: PacketType.GameEnd;
    payload: {
        players: [
            {
                id: string;
                nickname: string;
                color: number;
                score: number;
                kills: number;
            }
        ];
    };
};
type CustomError = Packet & {
    type: PacketType.CustomWarning;
    payload: {
        message: string;
    };
};
type ConnectionRejectedPacket = Packet & {
    type: PacketType.ConnectionRejected;
    payload: {
        reason: string;
    };
};

/**
 * Base interface for all game responses.
 */
interface GameResponse {
    type: PacketType;
    payload: {
        gameStateId: string;
    };
}
type MovementResponse = GameResponse & {
    type: PacketType.Movement;
    payload: {
        direction: MoveDirection;
    };
};
type RotationResponse = GameResponse & {
    type: PacketType.Rotation;
    payload: {
        tankRotation?: Rotation | null;
        turretRotation?: Rotation | null;
    };
};
type AbilityUseResponse = GameResponse & {
    type: PacketType.AbilityUse;
    payload: {
        abilityType: AbilityType;
    };
};
type PassResponse = GameResponse & {
    type: PacketType.Pass;
};

type Args = {
    nickname: string;
    host?: string;
    port?: number;
    code?: string;
    quickJoin?: boolean;
};
/**
 * Represents game map after it has been parsed.
 */
type MapObject = {
    tiles: MapBlock[][];
    zones: Zone[];
    visibility: string[];
};

/**
 * Represents the game state at a given tick.
 */
declare class GameState {
    private _raw;
    private _map;
    private _agentId;
    constructor(payload: GameStatePacket["payload"], agentId: string | null);
    /**
     * The unique identifier of the game state.
     */
    get gameStateId(): string;
    /**
     * The tick at which the game state was taken.
     */
    get tick(): number;
    /**
     * The agent's player information.
     */
    get self(): GameStatePlayer | undefined;
    /**
     * The players in the game.
     */
    get players(): GameStatePlayer[];
    /**
     * The tank of the agent.
     */
    get myTank(): Tank | undefined;
    /**
     * The map of the game.
     *
     * Contains the tiles, zones, and visibility.
     */
    get map(): MapObject;
    /**
     * The raw game state packet.
     *
     * **Note:** Tiles in raw packet are stored in a 3D array.
     * Last dimension holds items in the tile (currently at most one item).
     *
     * **Warning:** Columns and rows are swapped in the raw packet.
     * First dimension is the column index, second dimension is the row index,
     * and third dimension is the list of items in the tile.
     *
     * @returns The raw game state packet.
     *
     */
    get raw(): GameStatePacket["payload"];
    /**
     * Parses the tiles of the map. Reduces the 3D array to a 2D array and
     * swaps columns and rows to match the actual map.
     *
     * @returns The parsed tiles of the map.
     */
    private _parseTiles;
    /**
     * Parses the map of the game.
     *
     * @returns The parsed map of the game.
     */
    private _parseMap;
}

/**
 * Interface for the agent.
 */
interface IAgent {
    /**
     * Called when the lobby data is received.
     * @param lobbyData - Lobby data received from the server.
     */
    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void;
    /**
     * Called when the game starts.
     */
    on_game_start(): void;
    /**
     * Called when the game state is received.
     *
     * Implement this method to make your bot move.
     * @param gameState - The current game state.
     */
    next_move(gameState: GameState): Promise<void>;
    /**
     * Called when the game ends.
     * @param results - The game results.
     */
    on_game_end(results: GameEndPacket["payload"]): void;
}

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
declare abstract class Agent implements IAgent {
    private _ws;
    private _isProcessing;
    private _gameStateId;
    private _delay;
    private _agentId;
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
    protected move(direction: MoveDirection): Promise<void>;
    /**
     * Sends a message to the server, resulting in taking a shot.
     */
    protected useBullet(): Promise<void>;
    /**
     * Sends a message to the server, resulting in using the double shot ability.
     */
    protected useDoubleBullet(): Promise<void>;
    /**
     * Sends a message to the server, resulting in using the laser ability.
     */
    protected useLaser(): Promise<void>;
    /**
     * Sends a message to the server, resulting in using the radar ability.
     */
    protected useRadar(): Promise<void>;
    /**
     * Sends a message to the server, resulting in using the mine ability (dropping a mine).
     */
    protected useMine(): Promise<void>;
    /**
     * Sends a pass message to the server, resulting in no action being taken.
     */
    protected pass(): Promise<void>;
    /**
     * Sends a message to the server, resulting in rotating the tank and turret.
     * @param tankRotation - The rotation of the tank.
     * @param turretRotation - The rotation of the turret.
     */
    protected rotate(tankRotation: Rotation | null, turretRotation: Rotation | null): Promise<void>;
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

/**
 * A simple logger class that provides colored output to the console.
 */
declare class Log {
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

/**
 * Timer class to measure the time of a function or a loop
 *
 * Either use {@link start} and {@link stop} to measure time of execution of block of code or use {@link interval} to measure the time of a loop.
 */
declare class Timer {
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

export { AbilityType, type AbilityUseResponse, Agent, type Args, type Bullet, BulletType, type ConnectionRejectedPacket, type CustomError, Direction, type Empty, type GameEndPacket, GameState, type GameStatePacket, type GameStatePlayer, type Item, ItemTypes, type Laser, LaserOrientation, type LobbyDataPacket, type LobbyDataPlayer, Log, type MapBlock, type MapObject, type Mine, MoveDirection, type MovementResponse, type Packet, PacketType, type PassResponse, type PongPacket, Rotation, type RotationResponse, type ServerSettings, type Tank, TextBackground, TextColor, type TileItem, TileTypes, Timer, type Turret, type Wall, type Zone, type ZoneStatus, ZoneStatusTypes };
