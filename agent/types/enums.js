"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TileTypes = exports.TextBackground = exports.TextColor = exports.ZoneStatusTypes = exports.Rotation = exports.MoveDirection = exports.Direction = exports.PacketType = void 0;
/**
 * Enum for the different types of packets that can be sent between the server and the client.
 *
 * The packet type is encoded as follows:
 * - 4 most significant bits represent the group of the packet - xxxx 0000
 * - 4th least significant bit determines if the packet has a payload - 0000 x000
 * - 3 least significant bits represent the type of the packet - 0000 0xxx
 */
var PacketType;
(function (PacketType) {
    PacketType[PacketType["Unknown"] = 0] = "Unknown";
    // Bit flag to indicate that the packet has a payload
    PacketType[PacketType["HasPayload"] = 8] = "HasPayload";
    // COMMUNICATION GROUP
    PacketType[PacketType["CommunicationGroup"] = 16] = "CommunicationGroup";
    PacketType[PacketType["Ping"] = 17] = "Ping";
    PacketType[PacketType["Pong"] = 18] = "Pong";
    PacketType[PacketType["ConnectionAccepted"] = 19] = "ConnectionAccepted";
    PacketType[PacketType["ConnectionRejected"] = 28] = "ConnectionRejected";
    // LOBBY GROUP
    PacketType[PacketType["LobbyGroup"] = 32] = "LobbyGroup";
    PacketType[PacketType["LobbyData"] = 41] = "LobbyData";
    PacketType[PacketType["LobbyDeleted"] = 34] = "LobbyDeleted";
    // GAME STATE GROUP
    PacketType[PacketType["GameStateGroup"] = 48] = "GameStateGroup";
    PacketType[PacketType["GameStart"] = 49] = "GameStart";
    PacketType[PacketType["GameState"] = 58] = "GameState";
    PacketType[PacketType["GameEnd"] = 59] = "GameEnd";
    // PLAYER RESPONSE GROUP
    PacketType[PacketType["PlayerResponseGroup"] = 64] = "PlayerResponseGroup";
    PacketType[PacketType["TankMovement"] = 73] = "TankMovement";
    PacketType[PacketType["TankRotation"] = 74] = "TankRotation";
    PacketType[PacketType["TankShoot"] = 75] = "TankShoot";
    PacketType[PacketType["ResponsePass"] = 79] = "ResponsePass";
    // WARNING GROUP GROUP
    PacketType[PacketType["WarningGroup"] = 224] = "WarningGroup";
    PacketType[PacketType["CustomWarning"] = 233] = "CustomWarning";
    PacketType[PacketType["AlreadyMadeMovementWarning"] = 226] = "AlreadyMadeMovementWarning";
    PacketType[PacketType["ActionIgnoredDueToDeadWarning"] = 227] = "ActionIgnoredDueToDeadWarning";
    PacketType[PacketType["SlowResponseWarningWarning"] = 228] = "SlowResponseWarningWarning";
    // ERROR GROUP GROUP
    PacketType[PacketType["ErrorGroup"] = 240] = "ErrorGroup";
    PacketType[PacketType["InvalidPacketTypeError"] = 241] = "InvalidPacketTypeError";
    PacketType[PacketType["InvalidPacketUsageError"] = 242] = "InvalidPacketUsageError";
})(PacketType || (exports.PacketType = PacketType = {}));
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (exports.Direction = Direction = {}));
var MoveDirection;
(function (MoveDirection) {
    MoveDirection[MoveDirection["Forward"] = 0] = "Forward";
    MoveDirection[MoveDirection["Backward"] = 1] = "Backward";
})(MoveDirection || (exports.MoveDirection = MoveDirection = {}));
var Rotation;
(function (Rotation) {
    Rotation[Rotation["Left"] = 0] = "Left";
    Rotation[Rotation["Right"] = 1] = "Right";
})(Rotation || (exports.Rotation = Rotation = {}));
var ZoneStatusTypes;
(function (ZoneStatusTypes) {
    ZoneStatusTypes["Neutral"] = "neutral";
    ZoneStatusTypes["BeingCaptured"] = "beingCaptured";
    ZoneStatusTypes["Captured"] = "captured";
    ZoneStatusTypes["BeingContested"] = "beingContested";
    ZoneStatusTypes["BeingRetaken"] = "beingRetaken";
})(ZoneStatusTypes || (exports.ZoneStatusTypes = ZoneStatusTypes = {}));
var TextColor;
(function (TextColor) {
    TextColor[TextColor["Black"] = 30] = "Black";
    TextColor[TextColor["Red"] = 31] = "Red";
    TextColor[TextColor["Green"] = 32] = "Green";
    TextColor[TextColor["Yellow"] = 33] = "Yellow";
    TextColor[TextColor["Blue"] = 34] = "Blue";
    TextColor[TextColor["Magenta"] = 35] = "Magenta";
    TextColor[TextColor["Cyan"] = 36] = "Cyan";
    TextColor[TextColor["White"] = 37] = "White";
})(TextColor || (exports.TextColor = TextColor = {}));
var TextBackground;
(function (TextBackground) {
    TextBackground[TextBackground["Black"] = 40] = "Black";
    TextBackground[TextBackground["Red"] = 41] = "Red";
    TextBackground[TextBackground["Green"] = 42] = "Green";
    TextBackground[TextBackground["Yellow"] = 43] = "Yellow";
    TextBackground[TextBackground["Blue"] = 44] = "Blue";
    TextBackground[TextBackground["Magenta"] = 45] = "Magenta";
    TextBackground[TextBackground["Cyan"] = 46] = "Cyan";
    TextBackground[TextBackground["White"] = 47] = "White";
})(TextBackground || (exports.TextBackground = TextBackground = {}));
var TileTypes;
(function (TileTypes) {
    TileTypes["Empty"] = "empty";
    TileTypes["Wall"] = "wall";
    TileTypes["Bullet"] = "tank";
    TileTypes["Tank"] = "bullet";
})(TileTypes || (exports.TileTypes = TileTypes = {}));
//# sourceMappingURL=enums.js.map