import type { GameStatePacket, GameStatePlayer, MapObject } from ".";
/**
 * Represents the game state at a given tick.
 */
export declare class GameState {
    private _raw;
    private _map;
    constructor(payload: GameStatePacket["payload"]);
    /**
     * The unique identifier of the game state.
     */
    get gameStateId(): string;
    /**
     * The tick at which the game state was taken.
     */
    get tick(): number;
    /**
     * The players in the game.
     */
    get players(): GameStatePlayer[];
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
    getRaw(): GameStatePacket["payload"];
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
