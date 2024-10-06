/**
 * Enum for the different types of packets that can be sent between the server and the client.
 *
 * The packet type is encoded as follows:
 * - 4 most significant bits represent the group of the packet - xxxx 0000
 * - 4th least significant bit determines if the packet has a payload - 0000 x000
 * - 3 least significant bits represent the type of the packet - 0000 0xxx
 */
export declare enum PacketType {
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
    TankMovement = 73,
    TankRotation = 74,
    TankShoot = 75,
    ResponsePass = 79,
    WarningGroup = 224,
    CustomWarning = 233,
    AlreadyMadeMovementWarning = 226,
    ActionIgnoredDueToDeadWarning = 227,
    SlowResponseWarningWarning = 228,
    ErrorGroup = 240,
    InvalidPacketTypeError = 241,
    InvalidPacketUsageError = 242
}
export declare enum Direction {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3
}
export declare enum MoveDirection {
    Forward = 0,
    Backward = 1
}
export declare enum Rotation {
    Left = 0,
    Right = 1
}
export declare enum ZoneStatusTypes {
    Neutral = "neutral",
    BeingCaptured = "beingCaptured",
    Captured = "captured",
    BeingContested = "beingContested",
    BeingRetaken = "beingRetaken"
}
export declare enum TextColor {
    Black = 30,
    Red = 31,
    Green = 32,
    Yellow = 33,
    Blue = 34,
    Magenta = 35,
    Cyan = 36,
    White = 37
}
export declare enum TextBackground {
    Black = 40,
    Red = 41,
    Green = 42,
    Yellow = 43,
    Blue = 44,
    Magenta = 45,
    Cyan = 46,
    White = 47
}
export declare enum TileTypes {
    Empty = "empty",
    Wall = "wall",
    Bullet = "tank",
    Tank = "bullet"
}
