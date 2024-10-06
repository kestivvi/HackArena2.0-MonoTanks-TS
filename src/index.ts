import { Agent, type GameEndPacket, GameState, LobbyDataPacket, Log, MoveDirection, Rotation } from "../agent";

class MyAgent extends Agent {
    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void {
        Log.info("Lobby data received");
    }

    on_game_start(): void {
        Log.info("Game started");
    }

    next_move(gameState: GameState): Promise<void> {
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
            return this.rotateTank(randomRotation(), randomRotation());
        }

        if (random < 0.5) {
            const direction = Math.random() < 0.5 ? MoveDirection.Forward : MoveDirection.Backward;
            return this.moveTank(direction);
        }
        if (random < 0.75) {
            return this.pass();
        }

        return this.shoot();
    }

    on_game_end(results: GameEndPacket["payload"]): void {
        Log.info("Game ended");
    }
}

new MyAgent();
