import type { TileBlock, Zones } from "./packet.types";
export type Args = {
    nickname: string;
    host?: string;
    port?: number;
    code?: string;
};
/**
 * Represents game map after it has been parsed.
 */
export type MapObject = {
    tiles: TileBlock[][];
    zones: Zones[];
    visibility: string[];
};
