import type { MoveDirection, PacketType, Rotation } from "./enums";
/**
 * Base interface for all game responses.
 */
interface GameResponse {
    type: PacketType;
    payload: {
        gameStateId: string;
    };
}
export type TankMovementResponse = GameResponse & {
    type: PacketType.TankMovement;
    payload: {
        direction: MoveDirection;
    };
};
export type TankRotationResponse = GameResponse & {
    type: PacketType.TankRotation;
    payload: {
        tankRotation?: Rotation | null;
        turretRotation?: Rotation | null;
    };
};
export type TankShootResponse = GameResponse & {
    type: PacketType.TankShoot;
};
export type PassResponse = GameResponse & {
    type: PacketType.ResponsePass;
};
export {};
