import type { Args } from "../types";
/**
 * Parses the command line arguments.
 *
 * Exits the program if the arguments are invalid.
 *
 * Arguments:
 * - `-n, --nickname <nickname>`: Nickname of the agent. This argument is
 * required and has to be unique in game environment.
 * - `-h, --host <host>`: Host to connect to. Defaults to `localhost`.
 * - `-p, --port <port>`: Port to connect to. Defaults to `5000`.
 * - `-c, --code <code>`: Code for joining a specific lobby.
 *
 * @returns The arguments passed to the program.
 */
declare function getArgs(): Args;
/**
 * Generates the URL to connect to the WebSocket server.
 * @param args - The arguments passed to the program.
 * @returns The URL to connect to the WebSocket server.
 */
declare function getUrl(args: Args): string;
export { getArgs, getUrl };
