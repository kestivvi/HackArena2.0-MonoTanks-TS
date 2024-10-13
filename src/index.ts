import { Agent, type GameEndPacket, GameState, LobbyDataPacket, Log, MoveDirection, Rotation, TileTypes } from "../agent";

/**
 * Here you can implement your agent.
 * 
 * As an example, we have implemented an agent that makes random moves.
 */
class MyAgent extends Agent {
    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void {
        // Function called when the lobby data is received (once when joining the lobby and
        // every time the lobby data is updated).
        Log.info("Lobby data received");
    }

    on_game_start(): void {
        // Function called when the game starts. You can use this function to initialize
        // your agent.
        Log.info("Game started");
    }

    next_move(gameState: GameState): Promise<void> {
        // Function called each game tick to determine the next move of the agent.
        // gameState is an object containing the current state of the game.
        // Checkout declaration of GameState for more information on how to use it.

        // To move tank use: this.move and this.rotate
        // To performe action use functions starting with "use": this.useBullet, this.useDoubleBullet,
        // this.useLaser, this.useMine, this.useRadar, this.pass.
        //
        // Functions that perform actions return a promise that resolves when the action is performed.
        // Remember to return the promise from next_move function.

        const random = Math.random();

        const randomRotation = (): Rotation | null => {
            if (Math.random() < 0.33) {
                return Rotation.Left;
            } else if (Math.random() < 0.66) {
                return Rotation.Right;
            }
            return null;
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

// Create an instance of your agent
new MyAgent();

// You can add delay here
// const myAgent = new MyAgent();
// myAgent.delay = 100;
