import { stdout } from "process";
import { Bot, Bullet, BulletDirection, BulletType, Direction, type GameEndPacket, GameState, Item, ItemTypes, LobbyDataPacket, Log, MoveDirection, Rotation, Tank, TileTypes } from "../bot";

/**
 * Here you can implement your bot.
 * 
 * As an example, we have implemented an bot that makes random moves.
 */
class MyBot extends Bot {
    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void {
        // Function called when the lobby data is received (once when joining the lobby and
        // every time the lobby data is updated).

        Log.info("Lobby data received");
    }

    on_game_starting(): Promise<void> {
        // Function called when all players have joined the lobby and game is about to start.
        // You can use this function to perform initialization of your bot.
        // When ready, send a message to the server using this.readyToReceiveGameState().
        // Remember to return the promise from that function.
        Log.info("Game is starting");

        return this.readyToReceiveGameState();
    }

    next_move(gameState: GameState): Promise<void> {
        // Function called each game tick to determine the next move of the bot.
        // gameState is an object containing the current state of the game.
        // Checkout declaration of GameState for more information on how to use it.
        //
        // To move tank use: this.move and this.rotate
        // To performe action use functions starting with "use": this.useBullet, this.useDoubleBullet,
        // this.useLaser, this.useMine, this.useRadar, 
        // To skip a move use: this.pass
        //
        // Functions that perform actions return a promise that resolves when the action is sent to the server.
        // Remember to return the promise from next_move function.

        // Printing current game state to the console to show the structure of the gameState object

        if (gameState.tick % 50 === 0) {
            Log.info("-------- Game state --------");
            Log.info("Game state ID: ", gameState.gameStateId);
            Log.info("Tick: ", gameState.tick);
            Log.info("Self: ", gameState.self);
            Log.info("Players: ", gameState.players);
            Log.info("My tank: ", gameState.myTank);
            gameState.map.tiles.forEach((row, i) => {
                row.forEach((cell, j) => {
                    let tileToPrint: string = "";

                    cell.forEach((tile, k) => {
                        switch (tile.type) {
                            case TileTypes.Empty:
                                tileToPrint = ' ';

                                if (gameState.map.visibility[i][j] === '1') {
                                    tileToPrint = '.';
                                }

                                gameState.map.zones.forEach((zone) => {
                                    if (zone.x <= j && j < zone.x + zone.width && zone.y <= i && i < zone.y + zone.height) {
                                        tileToPrint = String.fromCharCode(Number(zone.index));
                                    }
                                });
                                break;

                            case TileTypes.Wall:
                                tileToPrint = '#';
                                break;

                            case TileTypes.Bullet:
                                const bullet = tile as Bullet;
                                switch (bullet.payload.type) {
                                    case BulletType.Bullet:
                                        switch (bullet.payload.direction) {
                                            case BulletDirection.Up:
                                                tileToPrint = '^';
                                                break;
                                            case BulletDirection.Right:
                                                tileToPrint = '>';
                                                break;
                                            case BulletDirection.Down:
                                                tileToPrint = 'v';
                                                break;
                                            default:
                                                tileToPrint = '<';
                                                break;
                                        }
                                        break;
                                    default:
                                        switch (bullet.payload.direction) {
                                            case BulletDirection.Up:
                                                tileToPrint = '⇈';
                                                break;
                                            case BulletDirection.Right:
                                                tileToPrint = '⇉';
                                                break;
                                            case BulletDirection.Down:
                                                tileToPrint = '⇊';
                                                break;
                                            default:
                                                tileToPrint = '⇇';
                                                break;
                                        }
                                        break;
                                }
                                break;

                            case TileTypes.Tank:
                                const tank = tile as Tank;
                                if (tank.payload.ownerId === gameState.self?.id) {
                                    switch (tank.payload.direction) {
                                        case Direction.Up:
                                            tileToPrint = '↑';
                                            break;
                                        case Direction.Right:
                                            tileToPrint = '→';
                                            break;
                                        case Direction.Down:
                                            tileToPrint = '→'; // should this be '↓'?
                                            break;
                                        default:
                                            tileToPrint = '←';
                                            break;
                                    }
                                } else {
                                    tileToPrint = 'T';
                                }
                                break;

                            case TileTypes.Item:
                                if (tileToPrint !== "") {
                                    break;
                                }

                                const item = tile as Item;
                                switch (item.payload.type) {
                                    case ItemTypes.Laser:
                                        tileToPrint = 'L';
                                        break;
                                    case ItemTypes.DoubleBullet:
                                        tileToPrint = 'D';
                                        break;
                                    case ItemTypes.Radar:
                                        tileToPrint = 'R';
                                        break;
                                    default:
                                        tileToPrint = 'M';
                                }
                                break;

                            case TileTypes.Mine:
                                tileToPrint = 'X';
                                break;

                            case TileTypes.Laser:
                                tileToPrint = '|';
                                break;

                            default:
                                tileToPrint = '?';
                        }
                    });

                    process.stdout.write(tileToPrint);
                });

                process.stdout.write("\n");
            });

        }

        // Random bot
        const random = Math.random();
        const randomRotation = (): Rotation | null => {
            if (Math.random() < 0.33) {
                return Rotation.Left;
            } else if (Math.random() < 0.66) {
                return Rotation.Right;
            }
            return null;
        }

        if (random < 0.0001) {
            return this.requestLobbyData();
        }

        if (random < 0.25) {
            return this.rotate(randomRotation(), randomRotation());
        }

        if (random < 0.5) {
            const direction = Math.random() < 0.5 ? MoveDirection.Forward : MoveDirection.Backward;
            return this.move(direction);
        }
        if (random < 0.75) {
            return this.useRadar();
        }
        if (random < 0.8) {
            return this.useDoubleBullet();
        }
        if (random < 0.85) {
            return this.useLaser();
        }
        if (random < 0.9) {
            return this.useMine();
        }
        if (random < 0.95) {
            return this.useBullet();
        }

        return this.pass();
    }
    on_game_end(results: GameEndPacket["payload"]): void {
        // Function called when the game ends. You can use this function to analyze the results
        Log.info("Game ended");
    }
}

// Create an instance of your bot
new MyBot();
// You can add delay here
