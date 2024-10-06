import type { GameState } from "../types";
import type { GameEndPacket, LobbyDataPacket } from "../types";
/**
 * Interface for the agent.
 */
export interface IAgent {
    /**
     * Called when the lobby data is received.
     * @param lobbyData - Lobby data received from the server.
     */
    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void;
    /**
     * Called when the game starts.
     */
    on_game_start(): void;
    /**
     * Called when the game state is received.
     *
     * Implement this method to make your bot move.
     * @param gameState - The current game state.
     */
    next_move(gameState: GameState): Promise<void>;
    /**
     * Called when the game ends.
     * @param results - The game results.
     */
    on_game_end(results: GameEndPacket["payload"]): void;
}
