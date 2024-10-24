# HackArena 2.0 - TypeScript API Wrapper

This TypeScript Websocket client was created for Hackarena 2.0, organized by Koło Naukowe "init" from SGGW in Warsaw. It serves as an API wrapper for participants to create bots that can play the game.

To fully test and run the game, you will also need the game server and GUI client, as the GUI provides a visual representation of gameplay. You can find more information about the server and GUI client in the following repository:

[Server and GUI Client Repository](https://github.com/INIT-SGGW/HackArena2.0-MonoTanks)

## Game mechanics

You can find the rules of the game in the game instruction, that you can download from your account page on our [website](https://hackarena.pl/konto).

## CLI arguments

There are several arguments you can pass when launching the program:

- `-n, --nickname <nickname>`: Nickname of the bot. This argument is required and has to be unique in game environment.
- `-h, --host <host>`: Host to connect to. Defaults to `localhost`.
- `-p, --port <port>`: Port to connect to. Defaults to `5000`.
- `-c, --code <code>`: Code for joining a specific lobby.

> **Note**
>
> If you're using npm sripts to run the program, use `--` before declaring arguments for them to be passed to the command
>
> ```bash
> npm start -- -p 1234
> ```

## API wrapper special features

While building this API wrapper, we have added some features that helped us with testing the bot and we decided to give you access to them. Below you can find a description of these features.

### Using delay option

This option will delay the sending of messages to the server by the specified amount of milliseconds. This can be useful for testing how your bot behaves if computation takes a certain amount of time. To use this option, you need to use delay setter in Bot class. The value of this key can be either a number or an array of two numbers. If it is a number, it will delay every message by that amount of milliseconds. If it is an array, it will delay every message by a random amount of milliseconds between the two numbers in the array.

```typescript
const myBot = new Bot();
myBot.delay = 1000; // delays every message by 1000ms
myBot.delay = [500, 1000]; // delays every message by a random amount of milliseconds between 500 and 1000
```

### Timer

This API wrapper provides a simple timer that can be used to check how much time has some operation taken.

- `start()`: Starts the timer.
- `stop()`: Stops the timer.
- `getDuration()`: Returns the time in milliseconds.
- `interval()`: Starts the timer, if clock not running, otherwise saves the interval.
- `getAverageTime()`: Returns the average time in milliseconds of all intervals.

### Logger

This API wrapper provides a simple logger that can be used to log messages to the console. The logger has several methods that can be used to log different types of messages:

- `info(message: string)`: Logs an informational message.
- `connection(message: string)`: Logs a connection message.
- `error(message: string)`: Logs an error message.
- `warning(message: string)`: Logs a warning message.
- `server(message: string)`: Logs a server message.
- `debug(message: string)`: Logs a debug message.

## Running the bot

### 1. Running locally

To run the bot locally, you will need

- [git](https://git-scm.com/downloads) to clone the repository
- [Node.js](https://nodejs.org/) version `>=18.x.x` and `<22.x.x` to run the API wrapper
- npm to install dependencies and run the bot (npm is included with Node.js)

After installing git, Node.js and npm, you can run the following commands in the project directory:

To clone the respotory:

```bash
git clone https://github.com/INIT-SGGW/HackArena2024H2-TS.git
```

To install dependencies:

```bash
npm install
```

To compile the TypeScript code:

```bash
npm run build
```

To compile bot in watch mode (typescript will compile the code automatically when you save changes):

```bash
npm run build:watch
```

To run the bot:

```bash
npm start
```

To run bot in watch mode (bot will automatically reconnect to the server, when files change):

> **Note**
>
> Use `npm run build:watch` in another terminal to compile the code. Nodemon is watching dist folder for changes.

```bash
npm run start:watch
```

### 2. Running in Docker

To run the bot in Docker, you will need to have Docker installed on your machine. You can find installation instructions for Docker [here](https://docs.docker.com/get-docker/).

To build the Docker image use:

```bash
docker build -t bot .
```

To run the Docker container use:

```bash
docker run --rm bot -n <name> -h host.docker.internal
```

> **Note**
>
> Don't forget to run the game server with a host flag `-h *`

## FAQ

### What can we modify?

You can modify the src/index.ts file to implement your own bot logic as well as create new files in the src/ directory to implement additional functionality.

Please, do not modify any other files, as they are used for proper network communication with the game server.

### In what format we will need to submit our bot?

You will need to submit a zip file containing the whole repository. Of course, please, delete the node_modules and dist folders, so the file size is as small as possible.

### What if I have a problem with the API wrapper?

If you have any problems with the API wrapper, please contact any of the organizers. We will try to help you as soon as possible.
