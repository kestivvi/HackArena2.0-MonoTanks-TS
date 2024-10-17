# HackArena 2.0 - TypeScript framework

This TypeScript Websocket client was created for Hackarena 2.0, organized by Koło Naukowe "init" from SGGW in Warsaw. It serves as a framework for participants to create agents that can play the game.

To fully test and run the game, you will also need the game server and GUI client, as the GUI provides a visual representation of gameplay. You can find more information about the server and GUI client in the following repository:

[Server and GUI Client Repository](https://github.com/INIT-SGGW/HackArena2024H2-Game)

## CLI arguments

There are several arguments you can pass when launching the program:

- `-n, --nickname <nickname>`: Nickname of the agent. This argument is required and has to be unique in game environment.
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

> **Note**
>
> Prefered way to set flags is to include them in the [start](./package.json#L7) script declaration > in package.json file. This way you can run the client with the flags by simply > running `npm start`.
>
> ```json
> "scripts": {
>    "start": "node dist/index.js -n <nickname> -h <host> -p <port> -c <code>"
> }
> ```

## Using delay option

This option will delay the sending of messages to the server by the specified amount of milliseconds. This can be useful for testing how your agent behaves if computation takes a certain amount of time. To use this option, you need to use delay setter in Agent class. The value of this key can be either a number or an array of two numbers. If it is a number, it will delay every message by that amount of milliseconds. If it is an array, it will delay every message by a random amount of milliseconds between the two numbers in the array.

```typescript
const agent = new Bot();
agent.delay = 1000; // delays every message by 1000ms
agent.delay = [500, 1000]; // delays every message by a random amount of milliseconds between 500 and 1000
```

## Timer

This framework provides a simple timer that can be used to check how much time has some operation taken. The timer has two methods:

- `start()`: Starts the timer.
- `stop()`: Stops the timer.
- `getDuration()`: Returns the time in milliseconds.
- `interval()`: Starts the timer, if clock not running, otherwise saves the interval.
- `getAverageTime()`: Returns the average time in milliseconds of all intervals.

## Logger

This framework provides a simple logger that can be used to log messages to the console. The logger has several methods that can be used to log different types of messages:

- `info(message: string)`: Logs an informational message.
- `warning(message: string)`: Logs a warning message.
- `error(message: string)`: Logs an error message.
- `debug(message: string)`: Logs a debug message.

## Running the client

### 1. Running locally

To run the client locally, you will need

- [git](https://git-scm.com/downloads) to clone the repository
- [Node.js](https://nodejs.org/) version `>=18.x.x` to run the client
- npm to install dependencies and run the client (npm is included with Node.js)

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

Or to run the client in watch mode (typescript will copmile the code automatically when you save changes):

```bash
npm run build:watch
```

To run the client:

```bash
npm start
```

To run client in watch mode (client will automatically reconnect to the server, when files change):

> **Note**
>
> Use `npm run build:watch` in another terminal to compile the code. Nodemon is watching dist folder for changes.

> **Warning**
>
> Experimental feature. Game client may freeze after few reconnections.

```bash
npm run start:watch
```

### 2. Running in Docker

To run the client in Docker, you will need to have Docker installed on your machine. You can find installation instructions for Docker [here](https://docs.docker.com/get-docker/).

To build the Docker image use:

```bash
docker build -t client .
```

To run the Docker container use:

```bash
docker run --rm client -n <name> -h host.docker.internal / 172.17.0.1
```
