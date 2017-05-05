/**
 * Created by kevrat on 16.12.2016.
 */
import Item from './items/Item'
import Swipe from '../../node_modules/phaser-swipe/swipe'
import {Device} from './states/Boot';

export default class GameField extends Phaser.Group {
    /**
     *
     * @param {string} type - type of game(sweetHill, infinity)
     * @param currentLevel - current hill
     * @param game - ref to game
     * @param {number} x - x coord
     * @param {number} y - y coord
     * @param {number} width - field width
     * @param {number} height - field height
     * @param {number} rows - num of rows
     * @param {number} columns - num of columns
     */
    constructor(type, currentLevel, game, x, y, rows, columns) {
        super(game)
        if (type === 'sweetHill') {
            this.currentLevel = currentLevel
            this.currentLevel.currentTile = currentLevel.items[0]
            this.moves = 0;
            this.game.userController.getProgressByHillName(this.currentLevel.name).done = 0;
        }
        this.gameType = type;
        this.game = game;
        // this.width = width;
        // this.height = height;
        this.x = x;
        this.y = y;
        this.tileGrid = [];
        this.stackBonuses = [];
        for (let i = 0; i < rows; i++) {
            this.tileGrid.push(new Array(columns).fill(null))
        }
        // if(typeof mask !== undefined){
        //     this.mask = mask;
        //     for(let i=0;i<mask.length;i++){
        //         for(let j=0;j<mask[i].length;j++){
        //             if(mask[i][j]===-1){
        //                 this.tileGrid[i][j]=-1
        //             }
        //         }
        //     }
        // }
        this.completed = false
        this.rows = rows;
        this.columns = columns;

        this.activeTile1 = null;
        this.activeTile2 = null;

        this.canMove = null;
        this.tileWidth = this.game.cache.getFrameByName('assets', 'lolipop2').height//width / this.tileGrid.length;//

        this.tileTypes = [
            'cake1',
            'cake2',
            'donut1',
            'lolipop1',
            'lolipop2',
            'icecream1',
        ];
        this.bonusTypes = [
            {type: 'Bomb', icon: 'watermelon'}
        ];

        this.tiles = new Phaser.Group(game, this);

        let seed = Date.now();
        this.random = new Phaser.RandomDataGenerator([seed]);
        this.createSignals()

        this.emitter = new Phaser.Particles.Arcade.Emitter(game, 0, 0, 100);
        // this.emitter.setXSpeed(0, 0);
        // this.emitter.setYSpeed(0, 0);


        this.emitter.gravity = 1000;
        // this.tiles.add(this.emitter)
        // this.emitter.start(true, 2000, 10, 60, false);
        game.physics.startSystem(Phaser.Physics.CHIPMUNK);
        // this.emitter.makeParticles('icons', null, 100, true, false);
        this.emitter.setSize(this.tileWidth, this.tileWidth)
        this.emitter.minParticleScale = 0.3;
        this.emitter.maxParticleScale = 0.5;
        this.emitter.bounce.setTo(0.5, 0.5);
        this.emitter.minParticleSpeed.setTo(-200, -200);
        this.emitter.maxParticleSpeed.setTo(200, 200);
        this.emitter.setAlpha(1, 0, 4000, Phaser.Easing.Exponential.In);
        this.initTiles();
        // this.tiles.align(this.tileGrid.length, this.tileGrid.length, this.tileWidth, this.tileWidth, Phaser.CENTER)
        this.x = x;
        this.y = y;
        // let mask = game.add.graphics(0, 100);
        // mask.beginFill(0xffffff);
        // mask.drawRect(0,0,game.width, this.tiles.height);
        // this.tiles.mask = mask;

        // this.tiles.x = this.game.width * 0.1
        if (type === 'infinity') {
            this.score = 0;
            this.createScore();
        }

        this.game.time.events.add(600, () => {
            this.checkMatch();
        });
        let swipeModel = {
            up: this.swipeUp,
            down: function (point) {
                console.log('down')
            },
            left: function (point) {
                console.log('up')
            },
            right: function (point) {
                console.log('right')
            }
        };
        this.swipe = new Swipe(this.game);
        let bg = new Phaser.Graphics(game, 0, 0);
        bg.beginFill(0xfaa333);
        bg.drawRect(0, 0, this.tiles.width, this.tileWidth * rows);
        bg.alignIn(this.tiles.getBounds(), Phaser.TOP_LEFT)

        // this.add(bg)
        // this.sendToBack(bg)
        // this.add(this.emitter);
        // this.bringToTop(this.emitter);
        // this.add(this.tiles)

        // in update. The methods will only be called if you have a swipe.
        // point: { x: x, y: y }

    }

    /**
     * Create and bind signals
     */
    createSignals() {
        this.signals = {};
        this.signals.removeTile = new Phaser.Signal();
        this.signals.applyBonusBomb = new Phaser.Signal();
        this.signals.tileDropped = new Phaser.Signal();
        this.signals.playerMove = new Phaser.Signal();

        this.signals.tileDone = new Phaser.Signal();

        this.signals.tilesCrossOut = new Phaser.Signal();
        this.signals.tilesCrossOut.add((number, tileType) => {
            if (this.gameType === 'sweetHill') {
                if (this.currentLevel.currentTile.name === tileType) {
                    this.signals.tileDone.dispatch(tileType);
                }
            }
        });
        if (this.gameType === 'sweetHill') {
            this.signals.tileDone.add((tileType) => {
                if (this.currentLevel.currentTile.name === tileType) {
                    this.game.userController.doneTile(this.currentLevel.name);
                    let progressOnHill = this.game.userController.getProgressByHillName(this.currentLevel.name);
                    if (this.checkIfLevelDone()) {
                        this.doneLevel();
                    }
                    this.currentLevel.currentTile = this.currentLevel.items[progressOnHill.done];
                    this.game.state.getCurrentState().signals.isProgress.dispatch(progressOnHill);
                }
            });
            this.signals.playerMove.add(() => {
                this.moves++;
                if (this.checkIfLevelDone()) {
                    this.doneLevel();
                }
            })
        }

    }

    checkIfLevelDone() {
        let progressOnHill = this.game.userController.getProgressByHillName(this.currentLevel.name);
        return this.moves >= this.currentLevel.moves || progressOnHill.done >= this.currentLevel.items.length
    }

    doneLevel() {
        if (!this.completed) {
            let progressOnHill = this.game.userController.getProgressByHillName(this.currentLevel.name);
            this.completed = true;
            this.tiles.setAll('inputEnabled', false);
            let hillsJSON = this.game.cache.getJSON('hills');
            for (let hill of hillsJSON) {
                if (hill.name === this.currentLevel.name) {
                    let result;
                    if (progressOnHill.done >= hill.bronzeItem) {
                        result = 'bronze'
                    }
                    if (progressOnHill.done >= hill.silverItem) {
                        result = 'silver'
                    }
                    if (progressOnHill.done >= hill.goldItem) {
                        result = 'gold'
                    }
                    this.game.state.getCurrentState().signals.levelDone.dispatch(result);
                    break;
                }
            }
        }
    }

    /**
     * initialise tiles
     */
    initTiles() {
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid.length; j++) {
                let tile = this.addTile(i, j, true);
                while (this.getMatches(this.tileGrid).length > 0) {//пока есть совпадения
                    this.signals.removeTile.dispatch(this.tileGrid[i][j], true);
                    tile = this.addTile(i, j, true);
                }
            }
        }
    }

    /**
     * create and return new tile
     * @param i - coord in grid
     * @param j - coord in grid
     * @returns {tile}
     */
    addTile(i, j, isSilent = false, tileType = this.tileTypes[this.random.integerInRange(0, this.tileTypes.length - 1)]) {
        let tile = new Item(this.game, i, j, this.tileWidth, tileType, j * this.tileWidth, i * this.tileWidth)
        /**
         * remove tile from tiles group
         * @param tile - ref to tile
         * @param isSilent - if true don't increment score
         */
        let gameField = this;
        this.signals.removeTile.add(function (tile, isSilent = false) {
            if (tile.world.x === this.world.x && tile.world.y === this.world.y) {
                //Find where this tile lives in the theoretical grid
                // let tilePos = GameField.getTilePos(gameField.tileGrid, tile)
                // if (this.bonusType) {
                //     gameField.stackBonuses.push({type: this.bonusType, pos: tilePos});
                // }
                //Remove the tile from the screen


                //Remove the tile from the theoretical grid
                if (tile.i != -1 && tile.j != -1) {
                    gameField.tileGrid[tile.i][tile.j] = null;
                    tile.i = -1
                    tile.j = -1

                    //Increase the users score
                    if (!isSilent) {
                        gameField.incrementScore();

                        gameField.emitter.makeParticles('assets', tile.tileType, 1, true, false);
                        // gameField.emitter.x = tile.x;
                        // gameField.emitter.y = tile.y;
                        gameField.emitter.emitParticle(tile.x + gameField.tiles.worldPosition.x, tile.y + gameField.tiles.worldPosition.y, 'assets', tile.tileType)
                        gameField.game.add.tween(tile.scale).to({
                            x: 0,
                            y: 0
                        }, 250, Phaser.Easing.Linear.Out, true).onComplete.add(
                            () => {
                                gameField.tiles.remove(tile, true);
                            }
                        );
                    }
                    else {
                        gameField.tiles.remove(tile, true);
                    }
                }

            }
        }, tile);
        this.tileGrid[i][j] = tile;
        this.tiles.add(tile);
        tile.events.onInputDown.add((item, pointer) => {
            if (this.activeTile1 === item) {
                this.activeTile1 = null;
            }
            else {
                this.tileDown(item);
            }
            if (this.canMove)
                item.switchScaleTween()
            // this.activeTile1.switchScaleTween();
        });
        tile.anchor.setTo(0.5);
        if (isSilent) {
            tile.y = i * this.tileWidth;
        }
        else {
            this.game.add.tween(tile).to({y: i * this.tileWidth}, 500, Phaser.Easing.Bounce.Out, true);
        }
        //i*3+j+1
        // this.tiles.align(this.tileGrid.length, this.tileGrid.length, this.tileWidth, this.tileWidth, Phaser.CENTER)

        return tile;
    }

    /**
     * Reset active tiles
     */
    tileUp() {
        if (this.activeTile1 && this.canMove || this.activeTile1 && this.activeTile2)
            this.activeTile1.switchScaleTween();
        // if (this.activeTile2)
        //     this.activeTile2.resetScaleTween();
        this.activeTile1 = null;
        this.activeTile2 = null;
    }

    /**
     * Set the active tile and him position
     * @param item
     * @param pointer
     */
    tileDown(item, pointer) {
        if (this.canMove) {
            this.activeTile1 = item;
            this.startPosI = item.i;
            this.startPosJ = item.j;
        }
    }

    crossOutMatches(matches) {
        let matchesInfo = {};
        for (let match of matches) {
            for (let item of match) {
                matchesInfo[item.tileType] ? matchesInfo[item.tileType].number += 1 : matchesInfo[item.tileType] = {
                        number: 1
                    }
            }
        }
        for (let tileType in matchesInfo) {
            this.signals.tilesCrossOut.dispatch(matchesInfo[tileType].number, tileType)
        }
    }

    /**
     * Check grid for matches and return them
     * @param tileGrid
     * @returns {Array} - array of mathces
     */
    getMatches(tileGrid) {
        let matches = [];
        let groups = [];

        //Check for horizontal matches
        for (let i = 0; i < tileGrid.length; i++) {
            let tempArr = tileGrid[i];
            groups = [];

            for (let j = 0; j < tempArr.length; j++) {
                if (j < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2]) {
                        if (tileGrid[i][j].tileType == tileGrid[i][j + 1].tileType && tileGrid[i][j + 1].tileType == tileGrid[i][j + 2].tileType) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i][j + 1]) == -1) {
                                groups.push(tileGrid[i][j + 1]);
                            }
                            if (groups.indexOf(tileGrid[i][j + 2]) == -1) {
                                groups.push(tileGrid[i][j + 2]);
                            }
                        }
                    }
            }
            if (groups.length > 0) matches.push(groups);
        }

        //Check for vertical matches
        for (let j = 0; j < tileGrid.length; j++) {
            let tempArr = tileGrid[j];
            groups = [];
            for (let i = 0; i < tempArr.length; i++) {
                if (i < tempArr.length - 2)
                    if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
                        if (tileGrid[i][j].tileType == tileGrid[i + 1][j].tileType && tileGrid[i + 1][j].tileType == tileGrid[i + 2][j].tileType) {
                            if (groups.length > 0) {
                                if (groups.indexOf(tileGrid[i][j]) == -1) {
                                    matches.push(groups);
                                    groups = [];
                                }
                            }

                            if (groups.indexOf(tileGrid[i][j]) == -1) {
                                groups.push(tileGrid[i][j]);
                            }
                            if (groups.indexOf(tileGrid[i + 1][j]) == -1) {
                                groups.push(tileGrid[i + 1][j]);
                            }
                            if (groups.indexOf(tileGrid[i + 2][j]) == -1) {
                                groups.push(tileGrid[i + 2][j]);
                            }
                        }
                    }
            }
            if (groups.length > 0) matches.push(groups);
        }

        return matches;
    }

    /**
     * Check grid for possible moves, return true if they is
     * @returns {boolean}
     */
    lookForPossibles() {
        for (let col = 0; col < this.tileGrid.length; col++) {
            for (let row = 0; row < this.tileGrid.length; row++) {

                // воможна горизонтальная, две подряд
                if (this.matchPattern(col, row, [[1, 0]], [[-2, 0], [-1, -1], [-1, 1], [2, -1], [2, 1], [3, 0]])) {
                    return true;
                }

                // воможна горизонтальная, две по разным сторонам
                if (this.matchPattern(col, row, [[2, 0]], [[1, -1], [1, 1]])) {
                    return true;
                }

                // возможна вертикальная, две подряд
                if (this.matchPattern(col, row, [[0, 1]], [[0, -2], [-1, -1], [1, -1], [-1, 2], [1, 2], [0, 3]])) {
                    return true;
                }

                // воможна вертикальная, две по разным сторонам
                if (this.matchPattern(col, row, [[0, 2]], [[-1, 1], [1, 1]])) {
                    return true;
                }
            }
        }

        // не найдено возможных линий
        return false;
    }

    /**
     * Search witch pattern for moves, return true if moves exists
     * @param col - column
     * @param row - row
     * @param mustHave - array of position
     * @param needOne - needed tiles
     * @returns {boolean}
     */
    matchPattern(col, row, mustHave, needOne) {
        let thisType = this.tileGrid[col][row].tileType;
        // убедимся, что есть вторая фишка одного типа

        for (let i = 0; i < mustHave.length; i++) {
            if (!this.matchType(col + mustHave[i][0], row + mustHave[i][1], thisType)) {
                return false;
            }
        }

        // убедимся,  что третья фишка совпадает по типу с двумя другими
        for (let i = 0; i < needOne.length; i++) {
            if (this.matchType(col + needOne[i][0], row + needOne[i][1], thisType)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check for valide tile position
     * @param col - column
     * @param row - row
     * @param type - tile type
     * @returns {boolean}
     */
    matchType(col, row, type) {
        // убедимся, что фишка не выходит за пределы поля
        if ((col < 0) || (col >= this.tileGrid.length) || (row < 0) || (row >= this.tileGrid.length)) return false;
        return (this.tileGrid[col][row].tileType == type);
    }

    /**
     * Remove matches from grid
     * @param matches
     */
    removeTileGroup(matches) {

        //Loop through all the matches and remove the associated tiles
        for (let i = 0; i < matches.length; i++) {
            let tempArr = matches[i];

            for (let j = 0; j < tempArr.length; j++) {

                this.signals.removeTile.dispatch(tempArr[j]);

            }
        }
    }

    /**
     * apply bonus tiles
     */
    applyBonus() {
        while (this.stackBonuses.length > 0) {
            this.signals['applyBonus' + this.stackBonuses[0].type].dispatch(this.stackBonuses.shift());
        }
    }

    /**
     * Reset tiles down
     */
    resetTile() {
        //Loop through each column starting from the left
        for (let j = 0; j < this.tileGrid.length; j++) {

            //Loop through each tile in column from bottom to top
            for (let i = this.tileGrid.length - 1; i > 0; i--) {

                //If this space is blank, but the one above it is not, move the one above down
                if (this.tileGrid[i][j] == null && this.tileGrid[i - 1][j] != null) {
                    //Move the tile above down one
                    let tempTile = this.tileGrid[i - 1][j];
                    this.tileGrid[i][j] = tempTile;
                    this.tileGrid[i - 1][j] = null;
                    tempTile.i = i
                    tempTile.j = j
                    this.game.add.tween(tempTile).to({y: this.tileWidth * i}, 500, Phaser.Easing.Bounce.Out, true);

                    //The positions have changed so start this process again from the bottom
                    //NOTE: This is not set to this.tileGrid[i].length - 1 because it will immediately be decremented as
                    //we are at the end of the loop.
                    //@TODO если поле не квадратное, то здесь будут проблемы
                    i = this.tileGrid.length;
                }
            }
        }
    }

    /**
     * Fill grid with tiles
     */
    fillTile() {

        //Check for blank spaces in the grid and add new tiles at that position
        for (let i = 0; i < this.tileGrid.length; i++) {

            for (let j = 0; j < this.tileGrid.length; j++) {

                if (this.tileGrid[i][j] == null) {
                    this.addTile(i, j);
                }

            }
        }
    }

    /**
     * Update GameField
     */
    update() {
        this.game.physics.arcade.collide(this.emitter);
        if (this.canMove) {

            //trigger on swipe
            let direction = this.swipe.check();
            if (direction !== null) {
                let hoverX = direction.x;
                let hoverY = direction.y;

                let hoverPosJ = Math.floor((hoverX - this.tiles.worldPosition.x + this.tileWidth / 2) / this.tileWidth);
                let hoverPosI = Math.floor((hoverY - this.tiles.worldPosition.y + this.tileWidth / 2) / this.tileWidth);
                //Make sure we are within the bounds of the grid
                if (!(hoverPosI > this.tileGrid[0].length - 1 || hoverPosI < 0) && !(hoverPosJ > this.tileGrid.length - 1 || hoverPosJ < 0)) {
                    this.canMove = false;

                    //Set the second active tile (the one where the user dragged to)
                    this.activeTile1 = this.tileGrid[hoverPosI][hoverPosJ];
                    this.activeTile2 = null
                    switch (direction.direction) {
                        case this.swipe.DIRECTION_LEFT: {
                            this.activeTile2 = hoverPosJ > 0 ? this.tileGrid[hoverPosI][hoverPosJ - 1] : null;
                        }
                            break;
                        case this.swipe.DIRECTION_RIGHT: {
                            this.activeTile2 = hoverPosJ + 1 < this.tileGrid[hoverPosI].length ? this.tileGrid[hoverPosI][hoverPosJ + 1] : null;
                        }
                            break;
                        case this.swipe.DIRECTION_UP: {
                            this.activeTile2 = hoverPosI > 0 ? this.tileGrid[hoverPosI - 1][hoverPosJ] : null;
                        }
                            break;
                        case this.swipe.DIRECTION_DOWN: {
                            this.activeTile2 = hoverPosI + 1 < this.tileGrid.length ? this.tileGrid[hoverPosI + 1][hoverPosJ] : null;
                        }
                            break;
                    }

                    this.swapTiles();
                    // if (this.activeTile2) {
                    // }
                    //Swap the two active tiles

                    //After the swap has occurred, check the grid for any matches
                    this.game.time.events.add(500, () => {
                        this.checkMatch();
                    });
                }
                return
            }

            //
            // The user is currently dragging from a tile, so let's see if they have dragged
            // over the top of an adjacent tile
            if (this.activeTile1 && !this.activeTile2) {

                //Get the location of where the pointer is currently
                let hoverX = this.game.input.x;
                let hoverY = this.game.input.y;

                //Figure out what position on the grid that translates to
                let hoverPosJ = Math.floor((hoverX - this.tiles.worldPosition.x + this.tileWidth / 2) / this.tileWidth);
                let hoverPosI = Math.floor((hoverY - this.tiles.worldPosition.y + this.tileWidth / 2) / this.tileWidth);
                // console.log(hoverPosI, hoverPosJ)

                //See if the user had dragged over to another position on the grid
                let difI = (hoverPosI - this.startPosI);
                let difJ = (hoverPosJ - this.startPosJ);

                // console.log(hoverX, hoverY)
                // console.log(this.tiles.left, this.tiles.top)
                // console.log(hoverPosI, hoverPosJ)
                //Make sure we are within the bounds of the grid
                if (!(hoverPosI > this.tileGrid[0].length - 1 || hoverPosI < 0) && !(hoverPosJ > this.tileGrid.length - 1 || hoverPosJ < 0)) {


                    //If the user has dragged an entire tiles width or height in the x or y direction
                    //trigger a tile swap
                    if ((Math.abs(difJ) == 1 && difI == 0) || (Math.abs(difI) == 1 && difJ == 0)) {

                        //Prevent the player from making more moves whilst checking is in progress
                        this.canMove = false;

                        //Set the second active tile (the one where the user dragged to)
                        this.activeTile2 = this.tileGrid[hoverPosI][hoverPosJ];

                        //Swap the two active tiles
                        this.swapTiles();

                        //After the swap has occurred, check the grid for any matches
                        this.game.time.events.add(500, () => {
                            if (this.checkMatch()) {
                                this.signals.playerMove.dispatch();
                            }
                        });
                    }

                }

            }
        }
    }

    /**
     * Swap active tiles
     */
    swapTiles() {
        if (this.activeTile1 && this.activeTile2 &&
            this.activeTile1.i > -1 && this.activeTile1.j > -1 &&
            this.activeTile2.i > -1 && this.activeTile2.j > -1) {

            let direction;

            if (this.activeTile1.i < this.activeTile2.i) {
                direction = {kx: 1, ky: -1}//'down'
            }
            if (this.activeTile1.i > this.activeTile2.i) {
                direction = {kx: 1, ky: 1}//'up'
            }
            if (this.activeTile1.j < this.activeTile2.j) {
                direction = {kx: -1, ky: -1}//'right'
            }
            if (this.activeTile1.j > this.activeTile2.j) {
                direction = {kx: 1, ky: -1}//'left'
            }

            //Swap them in our "theoretical" grid
            this.tileGrid[this.activeTile1.i][this.activeTile1.j] = this.activeTile2;
            this.tileGrid[this.activeTile2.i][this.activeTile2.j] = this.activeTile1;

            let i = this.activeTile1.i
            let j = this.activeTile1.j

            this.activeTile1.i = this.activeTile2.i
            this.activeTile1.j = this.activeTile2.j
            this.activeTile2.i = i
            this.activeTile2.j = j
            this.tiles.bringToTop(this.activeTile1)
            this.game.add.tween(this.activeTile1).to({
                x: [this.activeTile1.x, this.activeTile2.x + this.tileWidth / 2 * direction.kx, this.activeTile2.x],
                y: [this.activeTile1.y, this.activeTile2.y + this.tileWidth / 2 * direction.ky, this.activeTile2.y]
            }, 200, Phaser.Easing.Sinusoidal.InOut, true).interpolation(Phaser.Math.bezierInterpolation);

            this.game.add.tween(this.activeTile1.scale).to({
                x: [this.activeTile1.scale.x * 0.5, this.activeTile1.scale.x],
                y: [this.activeTile1.scale.y * 0.5, this.activeTile1.scale.y]
            }, 250, Phaser.Easing.Sinusoidal.InOut, true).interpolation(Phaser.Math.bezierInterpolation);

            this.game.add.tween(this.activeTile2).to({
                x: [this.activeTile2.x, this.activeTile1.x - this.tileWidth / 2 * direction.kx, this.activeTile1.x],
                y: [this.activeTile2.y, this.activeTile1.y - this.tileWidth / 2 * direction.ky, this.activeTile1.y]
            }, 200, Phaser.Easing.Sinusoidal.InOut, true).interpolation(Phaser.Math.bezierInterpolation);

            this.game.add.tween(this.activeTile2.scale).to({
                x: [this.activeTile2.scale.x * 0.5, this.activeTile2.scale.x],
                y: [this.activeTile2.scale.y * 0.5, this.activeTile2.scale.y]
            }, 250, Phaser.Easing.Sinusoidal.InOut, true).interpolation(Phaser.Math.bezierInterpolation);


            this.activeTile1 = this.tileGrid[this.activeTile1.i][this.activeTile1.j];
            this.activeTile2 = this.tileGrid[this.activeTile2.i][this.activeTile2.j];

        }


    }

    /**
     * Check grid for matches
     */
    checkMatch() {

        //Call the getMatches function to check for spots where there is
        //a run of three or more tiles in a row
        let matches = this.getMatches(this.tileGrid);

        //If there are matches, remove them
        if (matches.length > 0) {

            //Remove the tiles
            this.crossOutMatches(matches);
            this.removeTileGroup(matches);
            this.applyBonus();

            //Move the tiles currently on the board into their new positions
            this.resetTile();

            //Fill the board with new tiles wherever there is an empty spot
            this.fillTile();


            //Trigger the tileUp event to reset the active tiles
            this.game.time.events.add(500, () => {
                this.tileUp();
            });


            //Check again to see if the repositioning of tiles caused any new matches
            this.game.time.events.add(700, () => {
                this.checkMatch();
            });
            return true;

        }
        else {
            //No match so just swap the tiles back to their original position and reset
            this.swapTiles();
            this.game.time.events.add(500, () => {
                this.tileUp();
                if (!this.completed) {
                    this.canMove = true;
                }

            });

            if (!this.lookForPossibles()) {
                for (let i = 0; i < this.tileGrid.length; i++) {
                    for (let j = 0; j < this.tileGrid.length; j++) {
                        this.tileGrid[i][j] = null
                    }
                }
                this.tiles.removeAll(true)
                this.initTiles()
                this.game.time.events.add(600, () => {
                    this.checkMatch();
                });
            }
        }
        return false;
    }

    /**
     * Create score label
     */
    createScore() {
        let scoreFont = "100px Arial";
        this.game.userController.userInStorage.then((userInStorage) => {
            this.scoreLabel = this.game.add.text(0, 0, "0", {
                font: scoreFont,
                fill: "#4a2918"
            });
            this.scoreLabel.alignTo(this.tiles, Phaser.BOTTOM_CENTER);
            this.bestScoreLabel = this.game.add.text(0, 0, 'Best:' + userInStorage.bestScore, {
                font: scoreFont,
                fill: "#4a2918"
            });
            this.scoreLabel.alignTo(this.bestScoreLabel, Phaser.BOTTOM_CENTER);


        })

    }

    /**
     * Increment user score
     */
    incrementScore() {
        if (this.gameType === 'infinity') {
            this.score += 1;
            this.scoreLabel.text = this.score;
            this.game.userController.userInStorage.then((userInStorage) => {
                if (userInStorage.bestScore < this.score) {
                    this.bestScoreLabel.text = 'Best:' + this.score;
                    this.game.userController.updateBestScoreInStorage(this.score)
                }
            })

        }
    }
}