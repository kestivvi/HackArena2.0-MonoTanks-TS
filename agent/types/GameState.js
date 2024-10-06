"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const _1 = require(".");
/**
 * Represents the game state at a given tick.
 */
class GameState {
    constructor(payload) {
        this._raw = payload;
        this._map = null;
    }
    // ---- Getters ----
    /**
     * The unique identifier of the game state.
     */
    get gameStateId() {
        return this._raw.id;
    }
    /**
     * The tick at which the game state was taken.
     */
    get tick() {
        return this._raw.tick;
    }
    /**
     * The players in the game.
     */
    get players() {
        return this._raw.players;
    }
    /**
     * The map of the game.
     *
     * Contains the tiles, zones, and visibility.
     */
    get map() {
        if (this._map === null) {
            this._map = this._parseMap();
        }
        return this._map;
    }
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
    getRaw() {
        return this._raw;
    }
    // ---- Parsers ----
    /**
     * Parses the tiles of the map. Reduces the 3D array to a 2D array and
     * swaps columns and rows to match the actual map.
     *
     * @returns The parsed tiles of the map.
     */
    _parseTiles() {
        return this._raw.map.tiles[0].map((_, colIndex) => {
            return this._raw.map.tiles.map((row) => {
                const block = row[colIndex];
                return block.length === 0
                    ? { type: _1.TileTypes.Empty }
                    : block[0];
            });
        });
    }
    /**
     * Parses the map of the game.
     *
     * @returns The parsed map of the game.
     */
    _parseMap() {
        return {
            tiles: this._parseTiles(),
            zones: this._raw.map.zones,
            visibility: this._raw.map.visibility,
        };
    }
}
exports.GameState = GameState;
//# sourceMappingURL=GameState.js.map