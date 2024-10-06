"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = getArgs;
exports.getUrl = getUrl;
const commander_1 = require("commander");
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
function getArgs() {
    const program = new commander_1.Command();
    program
        .requiredOption("-n, --nickname <nickname>", "Nickname of the agent")
        .option("-h, --host <host>", "Host to connect to", "localhost")
        .option("-p, --port <port>", "Port to connect to", "5000")
        .option("-c, --code <code>", "Code for joining a specific lobby");
    try {
        program.parse(process.argv);
        const options = program.opts();
        return options;
    }
    catch (error) {
        program.help();
        process.exit(1);
    }
}
/**
 * Generates the URL to connect to the WebSocket server.
 * @param args - The arguments passed to the program.
 * @returns The URL to connect to the WebSocket server.
 */
function getUrl(args) {
    let url = `ws://${args.host}:${args.port}/?nickname=${args.nickname}&playerType=hackathonBot`;
    //TODO: delete thies
    // biome-ignore lint/correctness/noConstantCondition : This is a temporary workaround to avoid linting errors.
    if (true) {
        url += "&quickJoin=true";
    }
    if (args.code) {
        url += `&code=${args.code}`;
    }
    return url;
}
//# sourceMappingURL=args.js.map