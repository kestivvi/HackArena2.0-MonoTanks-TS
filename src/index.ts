import { Bot, Direction, type GameEndPacket, GameState, ItemTypes, LobbyDataPacket, MapBlock, MoveDirection, Rotation, Tank, TileTypes, Zone, ZoneStatusTypes } from "../bot";

type Position = {
    x: number;
    y: number;
}

type Path = Position[]

type RememberedPosition = {
    position: Position;
    ticksToClear: number;
}

type RememberedItem = {
    type: ItemTypes;
    position: Position;
}

const DIRECTIONS = [Direction.Down, Direction.Up, Direction.Left, Direction.Right];


class MyAgent extends Bot {
    private myId: string = '';
    private myTankPosition: Position | null = null;

    private targetTiles: Position[] = [];
    private targetZone: Zone | null = null;

    // private TICKS_TO_RECONSIDER_ZONE_CHANGE: number = 100;
    // private ticksToReevaluateTargetZone: number = this.TICKS_TO_RECONSIDER_ZONE_CHANGE;

    private dangerTiles: RememberedPosition[] = [];
    private targetNotReachableCounter: number = 0;
    private ignoreDangerTilesFor: number = 0;

    private rememberedItems: RememberedItem[] = [];

    private rememberedEnemyTanks: RememberedPosition[] = [];

    on_lobby_data_received(lobbyData: LobbyDataPacket["payload"]): void {
        // Function called when the lobby data is received (once when joining the lobby and
        // every time the lobby data is updated).
        this.myId = lobbyData.playerId;

        // Currently, if you want to use npm run start:watch you need to call here this.readyToReceiveGameState().
        // console.log("Lobby data received");
    }

    on_game_starting(): Promise<void> {
        // Function called when all players have joined the lobby and game is about to start.
        // You can use this function to perform initialization of your bot.
        // When ready, send a message to the server using this.readyToReceiveGameState().
        // Remember to return the promise from that function.
        // console.log("Game is starting");
        return this.readyToReceiveGameState();
    }

    next_move(gameState: GameState): Promise<void> {


        this.maintain_danger_tiles(gameState);
        this.maintain_remembered_items(gameState);
        this.maintain_remembered_enemy_tanks(gameState);

        // this.ticksToReevaluateTargetZone--;
        // if (this.ticksToReevaluateTargetZone <= 0) {
        //     this.targetZone = null;
        //     this.ticksToReevaluateTargetZone = this.TICKS_TO_RECONSIDER_ZONE_CHANGE;
        // }


        //////////////////////////////////////////////////
        //// Instincs 

        // IF I am dead THEN set target zone and target tile to null and do nothing
        const myTankPosition = this.get_my_tank_position(gameState);
        this.myTankPosition = myTankPosition;

        if (gameState.myTank === undefined || myTankPosition === null) {
            this.targetZone = null;
            this.targetTiles = [];
            // console.log("i am dead");
            return this.pass();
        }

        // IF enemy tank is neighbouring me AND its turret is at me THEN try to go one tile forward or backward
        const enemyTankNeighbouringMeAndItsTurretIsAtMe = DIRECTIONS.find(direction => {
            const position = this.add_direction_to_position(myTankPosition, direction);
            return gameState.map.tiles[position.y]?.[position.x]?.some(tile => tile.type === TileTypes.Tank && tile.payload.ownerId !== this.myId && tile.payload.turret.direction === this.reverse_direction(direction));
        });
        const iAmPerpendicularToEnemyTank = enemyTankNeighbouringMeAndItsTurretIsAtMe && this.perpendicular_directions(enemyTankNeighbouringMeAndItsTurretIsAtMe).includes(gameState.myTank.payload.direction);
        if (enemyTankNeighbouringMeAndItsTurretIsAtMe && iAmPerpendicularToEnemyTank && Math.random() < 0.8) {
            const positionForward = this.add_direction_to_position(myTankPosition, gameState.myTank.payload.direction);
            const isTileForwardEmpty = gameState.map.tiles[positionForward.y]?.[positionForward.x]?.some(tile => tile.type === TileTypes.Empty);

            if (isTileForwardEmpty) {

                const action = this.go_to_position(gameState, gameState.myTank, myTankPosition, positionForward, true);
                if (action !== null) {
                    // console.log("Enemy tank neighbouring me and its turret is at me and i am perpendicular to it and i can go forward");
                    return action();
                }
            }

            const positionBackward = this.add_direction_to_position(myTankPosition, this.reverse_direction(gameState.myTank.payload.direction));
            const isTileBackwardEmpty = gameState.map.tiles[positionBackward.y]?.[positionBackward.x]?.some(tile => tile.type === TileTypes.Empty);
            if (isTileBackwardEmpty) {
                const action = this.go_to_position(gameState, gameState.myTank, myTankPosition, positionBackward, true);
                if (action !== null) {
                    // console.log("Enemy tank neighbouring me and its turret is at me and i am perpendicular to it and i can go backward");
                    return action();
                }
            }
        }


        // IF I have (bullets OR double bullets OR laser) AND there is enemy tank in direction of a turret THEN shoot with priority to laser, then to double bullets, then to bullets
        const bullets = gameState.myTank.payload.turret.bulletCount;
        // TODO: If this secondary item can be undefined?
        const doubleBullets = gameState.myTank.payload.secondaryItem === ItemTypes.DoubleBullet;
        const laser = gameState.myTank.payload.secondaryItem === ItemTypes.Laser;
        if (((bullets && bullets > 0) || doubleBullets || laser) && this.find_object_in_direction(gameState, myTankPosition, gameState.myTank.payload.turret.direction, (tileObject) => tileObject.type === TileTypes.Tank && tileObject.payload.ownerId !== this.myId)) {
            // // console.log("shoot | bullets:", bullets, "doubleBullets:", doubleBullets, "laser:", laser);

            const turretDirection = gameState.myTank.payload.turret.direction;
            const enemyPositionedNotPerpendicularToMe = this.find_object_in_direction(gameState, myTankPosition, turretDirection, (tileObject) => tileObject.type === TileTypes.Tank && tileObject.payload.ownerId !== this.myId && !this.perpendicular_directions(turretDirection).includes(tileObject.payload.direction));

            if (laser && enemyPositionedNotPerpendicularToMe) {
                // console.log("Enemy positioned not perpendicular to me and i have laser");
                return this.useLaser();
            }
            if (doubleBullets && enemyPositionedNotPerpendicularToMe) {
                // console.log("Enemy positioned not perpendicular to me and i have double bullets");
                return this.useDoubleBullet();
            }
            // console.log("Enemy in shoot line and i have bullets");
            return this.useBullet();
        }




        // IF bullet is coming to me AND I am perpendicular to the bullet AND one tile forward or backward is empty THEN move
        const bulletDirection = DIRECTIONS.find(direction => this.find_object_in_direction(gameState, myTankPosition, direction, (tileObject) => tileObject.type === TileTypes.Bullet && tileObject.payload.direction === this.reverse_direction(direction)));

        if (bulletDirection !== undefined) {
            const bulletPosition = this.find_object_in_direction(gameState, myTankPosition, bulletDirection, (tileObject) => tileObject.type === TileTypes.Bullet)!;
            const perpendicularDirections = this.perpendicular_directions(bulletDirection);
            const amIPerpendicularToBullet = perpendicularDirections && perpendicularDirections.includes(gameState.myTank.payload.direction);
            const pathToBullet = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, bulletPosition.x, bulletPosition.y, false);
            const isBullet3OrMoreTilesAway = pathToBullet && pathToBullet.length >= 4;

            // // console.log("bullet is coming to me");
            let positionOfEmptyTile: Position | null = null;

            for (const direction of perpendicularDirections) {
                const neighbouringTile = this.add_direction_to_position(myTankPosition, direction);
                const tileObjects = gameState.map.tiles[neighbouringTile.y]?.[neighbouringTile.x];

                if (tileObjects && tileObjects.some(tile => tile.type === TileTypes.Empty)) {
                    positionOfEmptyTile = neighbouringTile;
                    break;
                }
            }

            if (amIPerpendicularToBullet || isBullet3OrMoreTilesAway) {
                if (positionOfEmptyTile) {
                    const action = this.go_to_position(gameState, gameState.myTank, myTankPosition, positionOfEmptyTile, true);
                    if (action !== null) {
                        // console.log("move to avoid bullet");
                        return action();
                    }
                }
            }
        }

        // IF there is enemy tank in some straight line from me THEN rotate turret to it
        const enemyTankInDirection = DIRECTIONS.find(direction => this.find_object_in_direction(gameState, myTankPosition, direction, (tileObject) => tileObject.type === TileTypes.Tank && tileObject.payload.ownerId !== this.myId));

        if (enemyTankInDirection) {

            // const enemyPosition = this.add_direction_to_position(myTankPosition, enemyTankInDirection);
            // const pathToEnemy = enemyPosition && this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, enemyPosition.x, enemyPosition.y, false);
            // const isEnemyOneTileAway = pathToEnemy && pathToEnemy.length === 2;


            if (enemyTankInDirection !== undefined && enemyTankInDirection !== gameState.myTank.payload.turret.direction) {
                const turret_rotation = this.get_turret_rotation(gameState.myTank.payload.turret.direction, enemyTankInDirection);
                const tank_rotation = this.get_tank_perpendicular_rotation_to(gameState.myTank.payload.direction, enemyTankInDirection);
                if (turret_rotation !== null) {
                    // console.log("rotate to enemy tank");
                    return this.rotate(tank_rotation, turret_rotation);
                }
            }
        }

        // IF I have mine AND tile behind me is not wall THEN place it
        const hasMine = gameState.myTank.payload.secondaryItem === ItemTypes.Mine;
        const tileBehindMeIsEmpty = this.find_object_in_direction(gameState, myTankPosition, gameState.myTank.payload.direction, (tileObject) => tileObject.type === TileTypes.Empty);
        const tileBehindMeIsABreakPoint = this.isTileABreakPoint(gameState, this.add_direction_to_position(myTankPosition, this.reverse_direction(gameState.myTank.payload.direction)));
        const oneMoreTileBehindMeIsEmpty = tileBehindMeIsEmpty && this.find_object_in_direction(gameState, this.add_direction_to_position(myTankPosition, this.reverse_direction(gameState.myTank.payload.direction)), this.reverse_direction(gameState.myTank.payload.direction), (tileObject) => tileObject.type === TileTypes.Empty);

        if (hasMine && tileBehindMeIsEmpty && tileBehindMeIsABreakPoint && oneMoreTileBehindMeIsEmpty) {
            // // console.log("place mine");
            return this.useMine();
        }

        // IF I have radar THEN use radar
        const radar = gameState.myTank.payload.secondaryItem === ItemTypes.Radar;
        if (radar) {
            // // console.log("use radar");
            return this.useRadar();
        }

        ////////////////////////////////////////////
        //// Think


        // Check if target tile has been reached
        const targetTile = this.targetTiles[0];
        if (targetTile) {

            // First check if target tile is reachable
            const isTargetReachable = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, targetTile.x, targetTile.y);

            if (!isTargetReachable) {
                // console.log("target tile is not reachable (", targetTile.x, ",", targetTile.y, ")");
                this.targetTiles = this.targetTiles.slice(1);
            }

            // Then check if target tile has been reached
            const targetTileReached = targetTile.x === myTankPosition.x && targetTile.y === myTankPosition.y;
            if (targetTileReached) {
                // console.log("target tile reached (", targetTile.x, ",", targetTile.y, ")");
                this.targetTiles = this.targetTiles.slice(1);
            }

            // If target tile is not really safe THEN remove it from target tiles
            const targetTileIsSafe = this.isTileValidToGoTo(gameState.map.tiles, targetTile);
            if (!targetTileIsSafe) {
                this.targetTiles = this.targetTiles.filter(tile => tile.x !== targetTile.x && tile.y !== targetTile.y);
            }
        }

        // IF my target zone is CAPTURED by me THEN set target zone to null
        const zoneIamIn = this.find_in_what_zone_this_is(gameState, myTankPosition);

        if (zoneIamIn && zoneIamIn.status.type === ZoneStatusTypes.Captured && zoneIamIn.status.playerId === this.myId) {
            // // console.log("zone captured by me");
            this.targetZone = null;
        }

        // Reconsider if entering zone is a good idea
        // if (this.is_position_neighbouring_zone(gameState, myTankPosition)) {
        // // //     console.log("position neighbouring zone");
        //     this.targetZone = null;
        // }

        // IF my target zone is null THEN try to set it to zone that
        //   1. is NEUTRAL
        //   2. is CAPTURED
        //   3. is BEING_RETAKEN and it is captured by me
        //   4. is BEING_CONTESTED and it is captured by me
        //   5. is BEING_RETAKEN
        //   6. is BEING_CAPTURED
        //   7. is BEING_CONTESTED
        if (this.targetZone === null) {
            this.targetZone = this.find_zone_to_go_to(gameState, myTankPosition);
            // // console.log("target zone set to", this.targetZone?.index);
        }

        // IF my target zone is not null THEN find safe tile in zone and set it as target tile
        const targetZone = this.targetZone;
        if (targetZone) {
            // // console.log("target zone is not null");
            // Check if in targetTiles there is already a tile in zone
            const zoneTilesInTargetTiles = this.targetTiles.filter(tile => this.find_in_what_zone_this_is(gameState, tile)?.index === targetZone.index);
            if (zoneTilesInTargetTiles.length === 0) {
                // // console.log("no zone tiles in target tiles");

                // // console.log("target zone status", targetZone.status.type);

                const zone = gameState.map.zones.find(zone => zone.index === targetZone.index);
                // if (zone && zone.status.type === ZoneStatusTypes.BeingContested) {
                // //     console.log("zone is being contested");

                //     const doIhaveSomeAmmo = (gameState.myTank.payload.turret.bulletCount && gameState.myTank.payload.turret.bulletCount > 0) || gameState.myTank.payload.secondaryItem === ItemTypes.DoubleBullet || gameState.myTank.payload.secondaryItem === ItemTypes.Laser;
                //     const positionToEngageEnemyTank = doIhaveSomeAmmo && this.engage_enemy_tank(gameState, myTankPosition, targetZone);
                //     if (positionToEngageEnemyTank) {
                // //         console.log("position to engage enemy tank", positionToEngageEnemyTank);
                //         this.unshiftToTargetTiles(positionToEngageEnemyTank);
                //     } else {

                //         const randomTile = this.get_random_tile_in_zone(gameState, targetZone);
                //         const isRandomTileAlreadyWhereIAm = randomTile && randomTile.x === myTankPosition.x && randomTile.y === myTankPosition.y;
                //         if (randomTile && !isRandomTileAlreadyWhereIAm) {
                // //             console.log("random tile (", randomTile.x, ",", randomTile.y, ")");
                //             this.pushToTargetTiles(randomTile);
                //         }

                //         // const randomFloat = Math.random();
                //         // if (randomFloat < 0.1) {
                //         //     const randomTile = this.get_random_tile_in_zone(gameState, targetZone);
                //         //     const isRandomTileAlreadyWhereIAm = randomTile && randomTile.x === myTankPosition.x && randomTile.y === myTankPosition.y;
                //         //     if (randomTile && !isRandomTileAlreadyWhereIAm) {
                // //         //         // console.log("random tile", randomTile);
                //         //         this.targetTiles.push(randomTile);
                //         //     }
                //         // } else {
                //         //     const safeTile = this.find_safe_tile_in_zone(gameState, targetZone);
                //         //     const isSafeTileAlreadyWhereIAm = safeTile && safeTile.x === myTankPosition.x && safeTile.y === myTankPosition.y;
                //         //     if (safeTile && !isSafeTileAlreadyWhereIAm) {
                // //         //         // console.log("safe tile", safeTile);
                //         //         this.targetTiles.push(safeTile);
                //         //     }        
                //         // }
                //     }

                // } else {
                // //     // console.log("zone is not being contested");
                //     const safeTile = this.find_safe_tile_in_zone(gameState, targetZone);
                //     if (safeTile) {
                // //         // console.log("safe tile", safeTile);
                //         this.pushToTargetTiles(safeTile);
                //     }
                // }


                const randomTileInZone = this.get_random_tile_in_zone(gameState, targetZone);
                if (randomTileInZone) {
                    this.pushToTargetTiles(randomTileInZone);
                }
            }
        }

        // IF I don't have secondary item and targetTile is not set to item and I see laser or double bullets or mine THEN set target tile to it
        // TODO: Prioritize lasers over double bullets over mines
        // const targetTileSetToItem = this.targetTiles.length > 0 && gameState.map.tiles[this.targetTiles[0].y][this.targetTiles[0].x].some(tile => tile.type === TileTypes.Item);

        // const targetTileIsVisible = targetTile && gameState.map.visibility[targetTile.y]?.[targetTile.x] === "1";
        // const firstTargetTileHasItem = targetTile && gameState.map.tiles[targetTile.y]?.[targetTile.x]?.some(tile => tile.type === TileTypes.Item);

        // if (targetTileIsVisible && !firstTargetTileHasItem) {
        // //     // console.log("target tile is visible and does not have item");
        //     this.targetTiles = this.targetTiles.filter(tile => tile.x !== targetTile.x && tile.y !== targetTile.y);
        // }

        const targetTilesHaveItem = this.targetTiles.length > 0 && this.targetTiles.some(tile => gameState.map.tiles[tile.y]?.[tile.x]?.some(tile => tile.type === TileTypes.Item));
        // const isCapturingZone = targetZone && ((targetZone.status.type === ZoneStatusTypes.BeingCaptured && targetZone.status.playerId === this.myId) || (targetZone.status.type === ZoneStatusTypes.BeingRetaken && targetZone.status.retakenById === this.myId));

        const isInZone = targetZone && this.find_in_what_zone_this_is(gameState, myTankPosition)?.index === targetZone.index;



        // @ts-expect-error
        if (!targetTilesHaveItem && !isInZone && (!gameState.myTank.payload.secondaryItem || gameState.myTank.payload.secondaryItem === ItemTypes.Unknown)) {
            const items = this.rememberedItems;

            // Sort items first by type (laser first, then radar, then double bullet, then mine) and then by distance to my tank
            items.sort((a, b) => {
                const typeOrder = [ItemTypes.Laser, ItemTypes.Radar, ItemTypes.DoubleBullet, ItemTypes.Mine];
                const typeOrderIndexA = typeOrder.indexOf(a.type);
                const typeOrderIndexB = typeOrder.indexOf(b.type);
                if (typeOrderIndexA !== typeOrderIndexB) {
                    return typeOrderIndexA - typeOrderIndexB;
                }
                const pathA = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, a.position.x, a.position.y);
                const pathB = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, b.position.x, b.position.y);
                if (pathA && pathB) {
                    return pathA.length - pathB.length;
                }
                return 0;
            });

            const item = items[0];
            if (item) {
                // // console.log("go to item ", item.type, " at (", item.position.x, ",", item.position.y, ")");
                this.unshiftToTargetTiles(item.position);
            }
        }

        // // @ts-expect-error
        // const doIHaveItem = !gameState.myTank.payload.secondaryItem || (gameState.myTank.payload.secondaryItem !== ItemTypes.Unknown)

        // let pickUpItem = false;
        // if (doIHaveItem && !this.hadItemPreviously) {
        //     pickUpItem = true;
        //     this.hadItemPreviously = true;
        // }




        // IF I have target tile THEN find path and go to it
        if (this.targetTiles.length > 0 && this.targetTiles[0]) {
            const action = this.go_to_position(gameState, gameState.myTank, myTankPosition, this.targetTiles[0]);
            if (action !== null) {
                // // console.log("go to target tile at (", this.targetTiles[0].x, ",", this.targetTiles[0].y, ")");
                return action();
            }
        }



        const isEnemyTankInShootLine = this.find_object_in_direction(gameState, myTankPosition, gameState.myTank.payload.turret.direction, (tileObject) => tileObject.type === TileTypes.Tank && tileObject.payload.ownerId !== this.myId);

        if (isEnemyTankInShootLine) {
            // // console.log("pass");
            return this.pass();
        }

        // const nearestEnemyTank = this.rememberedEnemyTanks.map(enemyTank => ({
        //     distance: this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, enemyTank.position.x, enemyTank.position.y)?.length || Infinity,
        //     position: enemyTank.position,
        // })).sort((a, b) => a.distance - b.distance)[0];

        // if (nearestEnemyTank) {
        //     const turretRotation = this.get_approximate_turret_rotation(gameState.myTank.payload.turret.direction, myTankPosition, nearestEnemyTank.position);
        //     if (turretRotation !== null) {
        //         return this.rotate(null, turretRotation);
        //     } else {
        //         return this.pass();
        //     }
        // } else {   
        // }
        return this.rotate(Rotation.Right, Rotation.Right);
    }

    on_game_end(results: GameEndPacket["payload"]): void {
        // Game ended
    }

    get_approximate_turret_rotation(current_direction: Direction, current_position: Position, target_position: Position): Rotation | null {
        // What I want to do is to get the angle between my tank and the enemy tank and then decide if I should rotate my turrent in order to be prepared for enemy

        const relativePosition = {
            x: target_position.x - current_position.x,
            y: target_position.y - current_position.y,
        }

        const angle = Math.atan2(relativePosition.y, relativePosition.x);

        const angleInDegrees = angle * (180 / Math.PI);
        // console.log("angleInDegrees", angleInDegrees);

        if (angleInDegrees > 0 && angleInDegrees < 45) {
            return this.get_turret_rotation(current_direction, Direction.Right);
        } else if (angleInDegrees > 45 && angleInDegrees < 135) {
            return this.get_turret_rotation(current_direction, Direction.Down);
        } else if (angleInDegrees > 135 && angleInDegrees < 225) {
            return this.get_turret_rotation(current_direction, Direction.Left);
        } else if (angleInDegrees > 225 && angleInDegrees < 315) {
            return this.get_turret_rotation(current_direction, Direction.Up);
        } else if (angleInDegrees > 315) {
            return this.get_turret_rotation(current_direction, Direction.Right);
        }

        return null;
    }

    unshiftToTargetTiles(position: Position): void {
        if (this.targetTiles.find(tile => tile.x === position.x && tile.y === position.y)) return;
        if (this.myTankPosition && this.myTankPosition.x === position.x && this.myTankPosition.y === position.y) return;
        this.targetTiles.unshift(position);
    }

    pushToTargetTiles(position: Position): void {
        if (this.targetTiles.find(tile => tile.x === position.x && tile.y === position.y)) return;
        if (this.myTankPosition && this.myTankPosition.x === position.x && this.myTankPosition.y === position.y) return;
        this.targetTiles.push(position);
    }

    isTileABreakPoint(gameState: GameState, tilePosition: Position): boolean {
        const { x, y } = tilePosition;
        const mapHeight = gameState.map.tiles.length;
        const mapWidth = gameState.map.tiles[0]?.length || 0;

        // Helper function to check if a tile is a wall or map edge
        const isWallOrEdge = (x: number, y: number): boolean => {
            if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) {
                return true; // Treat map edge as a wall
            }
            return this.isTileWall(gameState, x, y);
        };

        // Check vertical walls (top and bottom)
        const hasVerticalWalls = isWallOrEdge(x, y - 1) && isWallOrEdge(x, y + 1);

        // Check horizontal walls (left and right)
        const hasHorizontalWalls = isWallOrEdge(x - 1, y) && isWallOrEdge(x + 1, y);

        // Return true if the tile has either vertical or horizontal walls on opposite sides
        return hasVerticalWalls || hasHorizontalWalls;
    }

    private isTileWall(gameState: GameState, x: number, y: number): boolean {
        const tile = gameState.map.tiles[y]?.[x];
        return tile ? tile.some(item => item.type === TileTypes.Wall) : false;
    }

    // Action functions
    reverse_direction(direction: Direction): Direction {
        return (direction + 2) % 4;
    }

    perpendicular_directions(direction: Direction): Direction[] {
        return [(direction + 1) % 4, (direction + 3) % 4];
    }

    add_direction_to_position(position: Position, direction: Direction): Position {
        return {
            x: position.x + (direction === Direction.Right ? 1 : direction === Direction.Left ? -1 : 0),
            y: position.y + (direction === Direction.Down ? 1 : direction === Direction.Up ? -1 : 0),
        };
    }

    get_turret_rotation(current_direction: Direction, target_direction: Direction): Rotation | null {
        if (current_direction === target_direction) return null;

        if ((current_direction + 1) % 4 === target_direction) {
            return Rotation.Right;
        }

        return Rotation.Left;
    }

    get_tank_perpendicular_rotation_to(current_direction: Direction, perpendicular_direction: Direction): Rotation | null {
        if ((current_direction + 1) % 4 === (perpendicular_direction + 1) % 4) {
            return Rotation.Right;
        }

        if ((current_direction + 3) % 4 === (perpendicular_direction + 3) % 4) {
            return Rotation.Left;
        }

        return null;
    }

    get_random_tile_in_zone(gameState: GameState, zone: Zone): Position | null {
        const tilesInZone: Position[] = [];
        for (let y = zone.y; y < zone.y + zone.height; y++) {
            for (let x = zone.x; x < zone.x + zone.width; x++) {
                if (this.isTileValidToGoTo(gameState.map.tiles, { x, y })) {
                    tilesInZone.push({ x, y });
                }
            }
        }

        if (tilesInZone.length === 0) return null;

        return tilesInZone[Math.floor(Math.random() * tilesInZone.length)] || null;
    }

    maintain_danger_tiles(gameState: GameState): void {

        // Decrease ticks to clear for danger tiles
        for (const dangerTile of this.dangerTiles) {
            dangerTile.ticksToClear -= 1;
            if (dangerTile.ticksToClear <= 0) {
                this.dangerTiles = this.dangerTiles.filter(tile => tile.position.x !== dangerTile.position.x && tile.position.y !== dangerTile.position.y);
            }
        }


        for (let y = 0; y < gameState.map.tiles.length; y++) {
            for (let x = 0; x < gameState.map.tiles[y]!.length; x++) {
                const tileObjects = gameState.map.tiles[y]![x];
                if (!tileObjects) continue;

                const visible = gameState.map.visibility[y]![x]! === "1";

                if (!visible) {
                    continue;
                }

                const laser = tileObjects.find(object => object.type === TileTypes.Laser);
                if (laser) {
                    this.dangerTiles.push({ position: { x, y }, ticksToClear: 10 });
                }

                const mine = tileObjects.find(object => object.type === TileTypes.Mine);
                if (mine) {
                    this.dangerTiles.push({ position: { x, y }, ticksToClear: 100 });
                }

                const enemyTank = tileObjects.find(object => object.type === TileTypes.Tank && object.payload.ownerId !== this.myId);
                if (enemyTank) {
                    this.dangerTiles.push({ position: { x, y }, ticksToClear: 10 });
                }

                let enemyTankNearBy = false;
                for (const direction of DIRECTIONS) {
                    const position = this.add_direction_to_position({ x, y }, direction);
                    if (gameState.map.tiles[position.y]?.[position.x]?.some(tile => tile.type === TileTypes.Tank && tile.payload.ownerId !== this.myId)) {
                        enemyTankNearBy = true;
                        break;
                    }
                }

                if (this.dangerTiles.find(tile => tile.position.x === x && tile.position.y === y) && !laser && !mine && !enemyTankNearBy) {
                    this.dangerTiles = this.dangerTiles.filter(tile => tile.position.x !== x && tile.position.y !== y);
                }

            }
        }
    }

    maintain_remembered_items(gameState: GameState): void {

        for (let y = 0; y < gameState.map.tiles.length; y++) {
            for (let x = 0; x < gameState.map.tiles[y]!.length; x++) {
                const tileObjects = gameState.map.tiles[y]![x];
                if (!tileObjects) continue;
                if (tileObjects.some(object => object.type === TileTypes.Wall)) continue;

                const visible = gameState.map.visibility[y]![x]! === "1";
                if (!visible) continue

                // const hasItem = tileObjects.some(object => object.type === TileTypes.Item);
                // if (!hasItem) continue

                const isMined = tileObjects.some(object => object.type === TileTypes.Mine);

                const laser = tileObjects.find(object => object.type === TileTypes.Item && object.payload.type === ItemTypes.Laser);
                if (laser && !isMined) {
                    this.rememberedItems.push({ type: ItemTypes.Laser, position: { x, y } });
                }

                const doubleBullet = tileObjects.find(object => object.type === TileTypes.Item && object.payload.type === ItemTypes.DoubleBullet);
                if (doubleBullet && !isMined) {
                    this.rememberedItems.push({ type: ItemTypes.DoubleBullet, position: { x, y } });
                }

                const mine = tileObjects.find(object => object.type === TileTypes.Item && object.payload.type === ItemTypes.Mine);
                if (mine && !isMined) {
                    this.rememberedItems.push({ type: ItemTypes.Mine, position: { x, y } });
                }

                const radar = tileObjects.find(object => object.type === TileTypes.Item && object.payload.type === ItemTypes.Radar);
                if (radar && !isMined) {
                    this.rememberedItems.push({ type: ItemTypes.Radar, position: { x, y } });
                }

                // If item does not exist anymore, remove it from remembered items
                if (this.rememberedItems.find(item => item.position.x === x && item.position.y === y) && (isMined || (!laser && !doubleBullet && !mine && !radar))) {
                    this.rememberedItems = this.rememberedItems.filter(item => item.position.x !== x && item.position.y !== y);
                }

            }
        }
    }

    maintain_remembered_enemy_tanks(gameState: GameState): void {

        // Decrease ticks to clear for danger tiles
        for (const rememberedPosition of this.rememberedEnemyTanks) {
            rememberedPosition.ticksToClear -= 1;
            if (rememberedPosition.ticksToClear <= 0) {
                this.rememberedEnemyTanks = this.rememberedEnemyTanks.filter(position => position.position.x !== rememberedPosition.position.x && position.position.y !== rememberedPosition.position.y);
            }
        }


        for (let y = 0; y < gameState.map.tiles.length; y++) {
            for (let x = 0; x < gameState.map.tiles[y]!.length; x++) {
                const tileObjects = gameState.map.tiles[y]![x];
                if (!tileObjects) continue;

                const visible = gameState.map.visibility[y]![x]! === "1";

                if (!visible) {
                    continue;
                }

                const enemyTank = tileObjects.find(object => object.type === TileTypes.Tank && object.payload.ownerId !== this.myId);
                if (enemyTank) {
                    this.rememberedEnemyTanks.push({ position: { x, y }, ticksToClear: 8 });
                }

                if (this.rememberedEnemyTanks.find(position => position.position.x === x && position.position.y === y) && !enemyTank) {
                    this.rememberedEnemyTanks = this.rememberedEnemyTanks.filter(position => position.position.x !== x && position.position.y !== y);
                }

            }
        }
    }

    engage_enemy_tank(gameState: GameState, myTankPosition: Position, targetZone: Zone | null): Position | null {
        // // console.log("[ENGAGE_ENEMY] Engaging enemy tank");
        // // console.log("[ENGAGE_ENEMY] My tank position:", myTankPosition);
        // // console.log("[ENGAGE_ENEMY] Target zone:", targetZone);

        const enemyTanks = this.find_objects(gameState, (tileObject) => tileObject.type === TileTypes.Tank && tileObject.payload.ownerId !== this.myId);
        // // console.log("[ENGAGE_ENEMY] Enemy tanks found:", enemyTanks.length);

        const enemyTanksInZone = enemyTanks.filter(tank => targetZone === null || this.find_in_what_zone_this_is(gameState, tank)?.index === targetZone.index).sort((a, b) => {
            const pathToA = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, a.x, a.y);
            const pathToB = this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, b.x, b.y);
            if (pathToA && pathToB) {
                return pathToA.length - pathToB.length;
            }
            return 0;
        });
        // // console.log("[ENGAGE_ENEMY] Enemy tanks in zone:", enemyTanksInZone.length);

        const closestEnemyTank = enemyTanksInZone[0];
        // // console.log("[ENGAGE_ENEMY] Closest enemy tank:", closestEnemyTank);

        if (closestEnemyTank) {
            const positionsToShootFrom = this.get_straight_lines_positions_from_position(gameState, closestEnemyTank, 2);
            // // console.log("[ENGAGE_ENEMY] Positions to shoot from:", positionsToShootFrom.length);

            const pathsToShootLinePositions = positionsToShootFrom.map(position => this.find_path(gameState.map.tiles, myTankPosition.x, myTankPosition.y, position.x, position.y)).filter(path => path !== null);
            // // console.log("[ENGAGE_ENEMY] Valid paths to shoot from:", pathsToShootLinePositions.length);

            const shortestPathToShootLinePosition = pathsToShootLinePositions.sort((a, b) => a.length - b.length)[0];
            // // console.log("[ENGAGE_ENEMY] Shortest path to shoot from:", shortestPathToShootLinePosition);

            if (shortestPathToShootLinePosition) {
                const lastPosition = shortestPathToShootLinePosition[shortestPathToShootLinePosition.length - 1];
                if (lastPosition) {
                    // // console.log("[ENGAGE_ENEMY] Target position to move to:", lastPosition);
                    return lastPosition;
                }
            }
        }

        // // console.log("[ENGAGE_ENEMY] No suitable position found to engage enemy tank");
        return null;
    }

    is_position_neighbouring_zone(gameState: GameState, position: Position): boolean {
        const zones = gameState.map.zones;

        for (const zone of zones) {
            // Check top and bottom edges
            for (let x = zone.x - 1; x <= zone.x + zone.width; x++) {
                // Top edge
                if (x === position.x && zone.y - 1 === position.y) return true;
                // Bottom edge
                if (x === position.x && zone.y + zone.height === position.y) return true;
            }

            // Check left and right edges
            for (let y = zone.y - 1; y <= zone.y + zone.height; y++) {
                // Left edge
                if (zone.x - 1 === position.x && y === position.y) return true;
                // Right edge
                if (zone.x + zone.width === position.x && y === position.y) return true;
            }
        }

        return false;
    }

    go_to_zone(gameState: GameState, my_tank: Tank, zone: Zone): null | (() => Promise<void>) {
        let free_tiles: Position[] = [];

        for (let y = zone.y; y < zone.y + zone.height; y++) {
            for (let x = zone.x; x < zone.x + zone.width; x++) {
                if (gameState.map.tiles[y]?.[x]?.some(tile => tile.type === TileTypes.Empty)) {
                    free_tiles.push({ x, y });
                }
            }
        }

        if (free_tiles.length === 0) {
            return null;
        }

        const random_free_tile = free_tiles[Math.floor(Math.random() * free_tiles.length)];
        if (!random_free_tile) {
            return null;
        }

        return this.go_to_position(gameState, my_tank, this.myTankPosition!, random_free_tile);
    }

    go_to_position(gameState: GameState, my_tank: Tank, current_position: Position, target_position: Position, include_backward: boolean = false): null | (() => Promise<void>) {
        const path = this.find_path(gameState.map.tiles, current_position.x, current_position.y, target_position.x, target_position.y);


        if (path === null || path.length < 2) {
            return null;
        }
        // console.log("path", path);

        const current_direction = my_tank.payload.direction;
        const next_position = path[1];

        if (!next_position) {
            return null;
        }

        const rotation = this.get_rotation_to_next_position(current_position, next_position, current_direction, include_backward);
        if (rotation !== null) {
            // console.log("go to position rotate", rotation);
            return () => this.rotate(rotation, null);
        }

        const move_direction = this.get_move_direction(current_position, next_position, current_direction, include_backward);
        if (move_direction !== null) {
            // console.log("go to position move", move_direction);
            return () => this.move(move_direction);
        }

        return null;
    }

    // Utility functions

    find_safe_tile_in_zone(gameState: GameState, zone: Zone): Position | null {
        const tilesInZone: (Position & { score: number })[] = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];

        for (let y = zone.y; y < zone.y + zone.height; y++) {
            for (let x = zone.x; x < zone.x + zone.width; x++) {
                if (!this.isTileValidToGoTo(gameState.map.tiles, { x, y })) continue;

                let score = 1; // 1 point for being empty
                for (const { dx, dy } of directions) {
                    if (this.isTileValidToGoTo(gameState.map.tiles, { x: x + dx, y: y + dy })) {
                        score += 1
                    }
                }

                tilesInZone.push({ x, y, score });
            }
        }

        if (tilesInZone.length === 0) return null;

        tilesInZone.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.y !== a.y) return b.y - a.y;
            return b.x - a.x;
        });

        const bestTile = tilesInZone[0];

        return bestTile || null;
    }

    find_objects(gameState: GameState, predicate: (tileObject: MapBlock[number]) => boolean): Position[] {
        const objects: Position[] = [];

        for (let y = 0; y < gameState.map.tiles.length; y++) {
            const row = gameState.map.tiles[y];
            if (!row) continue;

            for (let x = 0; x < row.length; x++) {
                const tileObjects = row[x];
                if (tileObjects?.some(object => predicate(object))) {
                    objects.push({ x, y });
                }
            }
        }

        return objects;
    }

    rotation_to_other_tank(gameState: GameState): Rotation | null {
        if (!this.myTankPosition || !gameState.myTank) return null;

        const other_tanks: Position[] = [];

        for (let y = 0; y < gameState.map.tiles.length; y++) {
            const row = gameState.map.tiles[y];
            if (!row) continue;

            for (let x = 0; x < row.length; x++) {
                const tileObjects = row[x];
                if (!tileObjects) continue;

                const tank = tileObjects.find(object => object.type === TileTypes.Tank && object.payload.ownerId !== this.myId);
                if (tank) {
                    other_tanks.push({ x, y });
                }
            }
        }

        if (other_tanks.length === 0) return null;

        other_tanks.sort((a, b) => {
            const dist_a = Math.hypot(a.x - this.myTankPosition!.x, a.y - this.myTankPosition!.y);
            const dist_b = Math.hypot(b.x - this.myTankPosition!.x, b.y - this.myTankPosition!.y);
            return dist_a - dist_b;
        });

        const closest_tank = other_tanks[0];
        const turret_direction = gameState.myTank.payload.turret.direction;

        if (!this.myTankPosition || !closest_tank) return null;

        const angle = Math.atan2(closest_tank.y - this.myTankPosition.y, closest_tank.x - this.myTankPosition.x);
        const targetDirection = (Math.round(angle / (Math.PI / 2)) + 4) % 4;

        if (targetDirection === turret_direction) return null;

        const clockwiseDistance = (targetDirection - turret_direction + 4) % 4;
        return clockwiseDistance <= 2 ? Rotation.Right : Rotation.Left;
    }

    find_in_what_zone_this_is(gameState: GameState, position: Position): Zone | null {
        return gameState.map.zones.find(zone =>
            position.x >= zone.x && position.x < zone.x + zone.width &&
            position.y >= zone.y && position.y < zone.y + zone.height
        ) || null;
    }

    if_i_am_in_zone(gameState: GameState): Zone | null {
        if (!this.myTankPosition) return null;

        return gameState.map.zones.find(zone =>
            this.myTankPosition!.x >= zone.x && this.myTankPosition!.x < zone.x + zone.width &&
            this.myTankPosition!.y >= zone.y && this.myTankPosition!.y < zone.y + zone.height
        ) || null;
    }

    if_i_am_capturing_zone(gameState: GameState): boolean {
        const zone = this.if_i_am_in_zone(gameState);
        if (!zone) return false;

        return (zone.status.type === ZoneStatusTypes.BeingCaptured && zone.status.playerId === this.myId) ||
            (zone.status.type === ZoneStatusTypes.BeingRetaken && zone.status.retakenById === this.myId);
    }


    find_zone_to_go_to(gameState: GameState, myTankPosition: Position): Zone | null {
        const zones = gameState.map.zones;

        // Step 1: Assign priorities to zones
        const zonePriorities = zones.map(zone => {
            let priority = 0;
            const status = zone.status;

            // Assign priorities based on zone status
            // OLD
            // if (status.type === ZoneStatusTypes.BeingCaptured && status.playerId === this.myId) priority = 8;
            // else if (status.type === ZoneStatusTypes.BeingRetaken && status.retakenById === this.myId) priority = 7;
            // else if (status.type === ZoneStatusTypes.Neutral) priority = 6;
            // else if (status.type === ZoneStatusTypes.BeingRetaken && status.capturedById === this.myId) priority = 5;
            // else if (status.type === ZoneStatusTypes.BeingContested && status.capturedById === this.myId) priority = 4;
            // else if (status.type === ZoneStatusTypes.Captured && status.playerId === this.myId) priority = 3;
            // else if (status.type === ZoneStatusTypes.Captured && status.playerId !== this.myId) priority = 2;
            // else if (status.type === ZoneStatusTypes.BeingCaptured) priority = 1;
            // else if (status.type === ZoneStatusTypes.BeingContested) priority = 0;

            // NEW
            if (status.type === ZoneStatusTypes.BeingCaptured && status.playerId === this.myId) priority = 8;
            else if (status.type === ZoneStatusTypes.BeingRetaken && status.retakenById === this.myId) priority = 7;
            else if (status.type === ZoneStatusTypes.BeingRetaken && status.capturedById === this.myId) priority = 6;
            else if (status.type === ZoneStatusTypes.BeingContested && status.capturedById === this.myId) priority = 5;
            else if (status.type === ZoneStatusTypes.Captured && status.playerId === this.myId) priority = 4;
            else if (status.type === ZoneStatusTypes.Neutral) priority = 3;
            else if (status.type === ZoneStatusTypes.Captured && status.playerId !== this.myId) priority = 2;
            else if (status.type === ZoneStatusTypes.BeingCaptured) priority = 1;
            else if (status.type === ZoneStatusTypes.BeingContested) priority = 0;


            // Calculate the shortest path to the zone
            const path = this.find_shortest_path_to_zone(gameState, myTankPosition, zone);
            const distance = path ? path.length : Infinity;

            return { zone, priority, distance };
        });

        // Step 2: Sort zones by priority and then by distance
        zonePriorities.sort((a, b) => {
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
            return a.distance - b.distance;
        });

        // Step 3: Return the best zone or null if no zones are available
        return zonePriorities[0]?.zone || null;
    }

    // Helper function to find the shortest path to a zone
    find_shortest_path_to_zone(gameState: GameState, start: Position, zone: Zone): Path | null {
        let shortestPath: Path | null = null;
        let shortestLength = Infinity;

        // Check all tiles in the zone
        for (let y = zone.y; y < zone.y + zone.height; y++) {
            for (let x = zone.x; x < zone.x + zone.width; x++) {
                const path = this.find_path(gameState.map.tiles, start.x, start.y, x, y);
                if (path && path.length < shortestLength) {
                    shortestPath = path;
                    shortestLength = path.length;
                }
            }
        }

        return shortestPath;
    }

    other_tank_in_direction(gameState: GameState, my_tank_position: Position, direction: Direction): boolean {

        const direction_map: Record<Direction, Position> = {
            [Direction.Up]: { x: 0, y: -1 },
            [Direction.Down]: { x: 0, y: 1 },
            [Direction.Left]: { x: -1, y: 0 },
            [Direction.Right]: { x: 1, y: 0 },
        };

        let { x, y } = my_tank_position;
        const { x: dx, y: dy } = direction_map[direction];

        const { tiles } = gameState.map;

        while (y >= 0 && y < tiles.length && x >= 0 && x < tiles[y]!.length) {
            x += dx;
            y += dy;
            const objects = gameState.map.tiles[y]?.[x];
            if (!objects) break;

            if (objects.some(object => object.type === TileTypes.Wall)) break;
            if (objects.some(object => object.type === TileTypes.Tank && object.payload.ownerId !== this.myId)) return true;
        }

        return false;
    }

    find_object_in_direction(gameState: GameState, start_position: Position, direction: Direction, predicate: (tileObject: MapBlock[number]) => boolean): Position | null {
        const direction_map: Record<Direction, Position> = {
            [Direction.Up]: { x: 0, y: -1 },
            [Direction.Down]: { x: 0, y: 1 },
            [Direction.Left]: { x: -1, y: 0 },
            [Direction.Right]: { x: 1, y: 0 },
        };

        let { x, y } = start_position;
        const { x: dx, y: dy } = direction_map[direction];
        const { tiles } = gameState.map;

        while (true) {
            x += dx;
            y += dy;

            if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[y]!.length) break;

            const objects = tiles[y]?.[x];
            if (!objects) break;
            if (objects.some(object => object.type === TileTypes.Wall)) break;
            if (objects.some(predicate)) return { x, y };
        }

        return null;
    }

    get_my_tank_position(gameState: GameState): Position | null {
        if (!gameState.myTank) return null;

        for (let y = 0; y < gameState.map.tiles.length; y++) {
            const row = gameState.map.tiles[y];
            if (!row) continue;

            for (let x = 0; x < row.length; x++) {
                const tileObjects = row[x];
                if (!tileObjects) continue;

                if (tileObjects.some(object => object.type === TileTypes.Tank && object.payload.ownerId === this.myId)) {
                    return { x, y };
                }
            }
        }

        return null;
    }

    isTileValidToGoTo(map: MapBlock[][], position: Position, safe: boolean = true): boolean {
        const { x, y } = position;

        const isWithinBounds = x >= 0 && x < map[0]!.length && y >= 0 && y < map.length;
        if (!isWithinBounds) return false;

        const tileObjects = map[y]![x]!;
        const blockedByEnemy = tileObjects.some(tile => tile.type === TileTypes.Tank && tile.payload.ownerId !== this.myId);
        if (blockedByEnemy && safe) return false;

        const hasValidTile = tileObjects.some(tile =>
            tile.type === TileTypes.Empty ||
            tile.type === TileTypes.Item ||
            (tile.type === TileTypes.Tank && tile.payload.ownerId === this.myId)
        );
        if (!hasValidTile) return false;

        if (!safe) return true;

        const isDangerTile = this.dangerTiles.find(tile => tile.position.x === x && tile.position.y === y);

        return !isDangerTile;

    }

    find_path(map: MapBlock[][], start_x: number, start_y: number, end_x: number, end_y: number, safe: boolean = true): Path | null {

        const queue: Position[] = [{ x: start_x, y: start_y }];
        const visited = new Set<string>();
        const parent: { [key: string]: Position } = {};

        visited.add(`${start_x},${start_y}`);

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (current.x === end_x && current.y === end_y) {
                // Reconstruct the path
                const path: Path = [];
                let pos: Position | undefined = current;
                while (pos) {
                    path.unshift(pos);
                    pos = parent[`${pos.x},${pos.y}`];
                }
                this.targetNotReachableCounter = 0;
                if (this.ignoreDangerTilesFor > 0) {
                    this.ignoreDangerTilesFor--;
                }
                return path;
            }

            const directions = [
                { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
            ];

            for (const { dx, dy } of directions) {
                const nextX = current.x + dx;
                const nextY = current.y + dy;

                if (this.isTileValidToGoTo(map, { x: nextX, y: nextY }, this.ignoreDangerTilesFor === 0) && !visited.has(`${nextX},${nextY}`)) {
                    queue.push({ x: nextX, y: nextY });
                    visited.add(`${nextX},${nextY}`);
                    parent[`${nextX},${nextY}`] = current;
                }
            }
        }

        // If we've exhausted all possibilities without finding the end, return null
        this.targetNotReachableCounter++;
        if (this.targetNotReachableCounter > 10) {
            this.ignoreDangerTilesFor = 10;
            this.targetNotReachableCounter = 0;
        }
        return null;
    }



    get_rotation_to_next_position(current: Position, next: Position, current_direction: Direction, include_backward: boolean = false): Rotation | null {
        let result: Rotation | null = null;
        if (next.x > current.x && current_direction !== Direction.Right) {
            if (current_direction === Direction.Up) result = Rotation.Right;
            else if (current_direction === Direction.Down) result = Rotation.Left;
            else if (!include_backward) result = Rotation.Right;
        } else if (next.x < current.x && current_direction !== Direction.Left) {
            if (current_direction === Direction.Up) result = Rotation.Left;
            else if (current_direction === Direction.Down) result = Rotation.Right;
            else if (!include_backward) result = Rotation.Right;
        }
        else if (next.y > current.y && current_direction !== Direction.Down) {
            if (current_direction === Direction.Left) result = Rotation.Left;
            else if (current_direction === Direction.Right) result = Rotation.Right;
            else if (!include_backward) result = Rotation.Right;
        }
        else if (next.y < current.y && current_direction !== Direction.Up) {
            if (current_direction === Direction.Left) result = Rotation.Right;
            else if (current_direction === Direction.Right) result = Rotation.Left;
            else if (!include_backward) result = Rotation.Right;
        }
        return result;
    }

    get_move_direction(current: Position, next: Position, current_direction: Direction, include_backward: boolean = false): MoveDirection | null {
        if ((next.x > current.x && current_direction === Direction.Right) ||
            (next.x < current.x && current_direction === Direction.Left) ||
            (next.y > current.y && current_direction === Direction.Down) ||
            (next.y < current.y && current_direction === Direction.Up)) {
            return MoveDirection.Forward;
        }
        else if (include_backward && (
            (next.x > current.x && current_direction === Direction.Left) ||
            (next.x < current.x && current_direction === Direction.Right) ||
            (next.y > current.y && current_direction === Direction.Up) ||
            (next.y < current.y && current_direction === Direction.Down)
        )) {
            return MoveDirection.Backward;
        }
        return null;
    }

    get_straight_lines_positions_from_position(gameState: GameState, position: Position, minDistance: number = 1): Position[] {
        const { tiles } = gameState.map;
        const lines: Position[] = [];

        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        for (const { dx, dy } of directions) {
            let x = position.x + dx * minDistance;
            let y = position.y + dy * minDistance;

            while (x >= 0 && x < tiles[0]!.length && y >= 0 && y < tiles.length && !tiles[y]![x]!.every(tile => tile.type === TileTypes.Wall || (tile.type === TileTypes.Tank && tile.payload.ownerId !== this.myId) || tile.type === TileTypes.Mine || tile.type === TileTypes.Bullet || tile.type === TileTypes.Laser)) {
                lines.push({ x, y });
                x += dx;
                y += dy;
            }
        }

        return lines;
    }

    random_action(): Promise<void> {
        const random = Math.random();
        const randomRotation = (): Rotation | null => {
            const r = Math.random();
            if (r < 0.33) return Rotation.Left;
            if (r < 0.66) return Rotation.Right;
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
        if (random < 0.75) return this.useRadar();
        if (random < 0.8) return this.useDoubleBullet();
        if (random < 0.85) return this.useLaser();
        if (random < 0.9) return this.useMine();
        if (random < 0.95) return this.useBullet();

        return this.pass();
    }


}

// Create an instance of your agent
const agent = new MyAgent();
// You can add delay here if needed






