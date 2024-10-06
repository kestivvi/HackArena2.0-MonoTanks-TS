import type { Direction, PacketType, TileTypes, ZoneStatusTypes } from "./enums";
/**
 * Base interface for all packets.
 */
export interface Packet {
    type: PacketType;
}
export type PongPacket = Packet & {
    type: PacketType.Pong;
};
export type LobbyDataPlayer = {
    id: string;
    nickname: string;
    color: number;
};
export type ServerSettings = {
    gridDimension: number;
    numberOfPlayers: number;
    seed: number;
    ticks: number;
    broadcastInterval: number;
    eagerBroadcast: boolean;
};
export type LobbyDataPacket = Packet & {
    type: PacketType.LobbyData;
    payload: {
        playerId: string;
        players: LobbyDataPlayer[];
        serverSettings: ServerSettings;
    };
};
export type Bullet = {
    type: TileTypes.Bullet;
    payload: {
        id: number;
        speed: number;
        direction: number;
    };
};
export type Empty = {
    type: TileTypes.Empty;
};
export type Wall = {
    type: TileTypes.Wall;
};
export type Turret = {
    direction: Direction;
    bulletCount?: number;
    ticksToRegenBullet?: number | null;
};
export type Tank = {
    type: TileTypes.Tank;
    payload: {
        ownerId: string;
        direction: Direction;
        turret: Turret;
        health?: number;
    };
};
export type TileBlock = Bullet | Wall | Tank | Empty;
export type GameStatePlayer = {
    id: string;
    nickname: string;
    color: number;
    ping: number;
    score?: number;
    ticksToRegen?: number | null;
};
export type ZoneStatus = {
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
export type Zones = {
    x: number;
    y: number;
    width: number;
    height: number;
    index: string;
    status: ZoneStatus;
};
export type GameStatePacket = Packet & {
    type: PacketType.GameState;
    payload: {
        id: string;
        tick: number;
        players: GameStatePlayer[];
        map: {
            tiles: TileBlock[][][];
            zones: Zones[];
            visibility: string[];
        };
    };
};
export type GameEndPacket = Packet & {
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
export type CustomError = Packet & {
    type: PacketType.CustomWarning;
    payload: {
        message: string;
    };
};
export type ConnectionRejectedPacket = Packet & {
    type: PacketType.ConnectionRejected;
    payload: {
        reason: string;
    };
};
