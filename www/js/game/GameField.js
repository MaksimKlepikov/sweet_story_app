/**
 * Created by kevrat on 16.12.2016.
 */
class GameField {
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
    constructor(type, currentLevel, game, x, y, width, height, rows, columns) {
        if (type === 'sweetHill') {
            this.currentLevel = currentLevel
            this.currentLevel.currentTile = currentLevel.items[game.userController.getProgressByHillName(currentLevel.name).done]

        }
        this.gameType = type;
        this.game = game;
        this.width = width;
        this.height = height;
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
        this.tileSizeAbsolute = width / this.tileGrid.length;

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

        this.tiles = this.game.add.responsiveGroup();
        // this.tiles.setPinned(Fabrique.PinnedPosition.topCenter)

        let seed = Date.now();
        this.random = new Phaser.RandomDataGenerator([seed]);
        this.createSignals()
        this.initTiles();
        this.tiles.setPortraitScaling(90, true, true, Fabrique.PinnedPosition.topCenter)
        this.tiles.x = this.game.width * 0.1
        if (type === 'infinity') {
            this.tiles.x/=2
            this.score = 0;
            this.createScore();
        }
        this.tileSizeRelative = this.tiles.width / this.tileGrid.length

        this.game.time.events.add(600, () => {
            this.checkMatch();
        });
    }

    /**
     * Create and bind signals
     */
    createSignals() {
        this.signals = {};
        this.signals.removeTile = new Phaser.Signal();
        this.signals.applyBonusBomb = new Phaser.Signal();
        this.signals.tileDropped = new Phaser.Signal();

        this.signals.tilesCrossOut = new Phaser.Signal();
        this.signals.tilesCrossOut.add(function (tileType) {
            if (this.gameType === 'sweetHill') {
                if (this.currentLevel.currentTile.name === tileType) {
                    this.signals.tileDone.dispatch(tileType);
                }
            }
        }, this);

        this.signals.tileDone = new Phaser.Signal();
        this.signals.tileDone.add(function (tileType) {
            if (this.gameType === 'sweetHill') {
                if (this.currentLevel.currentTile.name === tileType) {
                    this.game.userController.doneTile(this.currentLevel.name)
                }
            }
        }, this);

        if (this.gameType === 'sweetHill') {
            this.game.signals.isProgress.add(function (hillName, done) {
                if (this.currentLevel.name === hillName) {
                    if (done < this.currentLevel.items.length) {
                        this.currentLevel.currentTile = this.currentLevel.items[done]
                    }
                    else {
                        console.log('level done')
                        this.game.userController.incrementLevel();
                        this.completed = true;
                        this.tiles.setAll('inputEnabled', false);
                        this.game.state.getCurrentState().createAwardWindow()
                    }
                }
            }, this);
        }

    }

    /**
     * initialise tiles
     */
    initTiles() {
        let tile;
        for (let i = 0; i < this.tileGrid.length; i++) {
            for (let j = 0; j < this.tileGrid.length; j++) {
                tile = this.addTile(i, j, this.tileSizeAbsolute);
                this.tileGrid[i][j] = tile;
                while (this.getMatches(this.tileGrid).length > 0) {//пока есть совпадения
                    this.signals.removeTile.dispatch(this.tileGrid[i][j], true);
                    this.tileGrid[i][j] = this.addTile(i, j, this.tileSizeAbsolute, this.tileTypes[this.random.integerInRange(0, this.tileTypes.length - 1)]);

                }
            }
        }
    }

    /**
     * create and return new tile
     * @param i - coord in grid
     * @param j - coord in grid
     * @param tileSize - size of tile
     * @returns {tile}
     */
    addTile(i, j, tileSize, tileType) {

        let tileIcon = this.tileTypes[this.random.integerInRange(0, this.tileTypes.length - 1)];

        if(tileType){
            tileIcon = tileType
        }

        let bonusChance = this.random.integerInRange(0, 100)
        let bonusType = null;
        let bonusIcon = null;

        let tile
        if (bonusType) {
            tile = this.game.add.responsiveSprite((j * tileSize) + tileSize / 2, 0, 'icons', bonusIcon)
        }
        else {
            tile = this.game.add.responsiveSprite((j * tileSize) + tileSize / 2, 0, 'icons', tileIcon)

        }
        tile.width = tileSize
        tile.height = tileSize

        tile.i = i;
        tile.j = j;

        this.tiles.add(tile)
        tile.bonusType = bonusType;
        this.game.add.tween(tile).to({y: i * this.tileSizeAbsolute + (this.tileSizeAbsolute / 2)}, 500, Phaser.Easing.Bounce.Out, true)

        tile.anchor.setTo(0.5);

        tile.inputEnabled = true;

        tile.tileType = tileIcon;

        tile.events.onInputDown.add(this.tileDown, this);

        const gameField = this;

        /**
         * remove tile from tiles group
         * @param tile - ref to tile
         * @param isSilent - if true don't increment score
         */
        this.signals.removeTile.add(function (tile, isSilent = false) {
            if (tile.world.x === this.world.x && tile.world.y === this.world.y) {
                //Find where this tile lives in the theoretical grid
                let tilePos = GameField.getTilePos(gameField.tileGrid, tile)
                if (this.bonusType) {
                    gameField.stackBonuses.push({type: this.bonusType, pos: tilePos});
                }
                //Remove the tile from the screen
                gameField.tiles.remove(tile);

                //Increase the users score
                if(!isSilent){
                    gameField.incrementScore();
                }

                //Remove the tile from the theoretical grid
                if (tilePos.i != -1 && tilePos.j != -1) {
                    gameField.tileGrid[tilePos.i][tilePos.j] = null;
                    this.i = -1
                    this.j = -1
                }

            }
        }, tile);

        return tile;
    }

    /**
     * Reset active tiles
     */
    tileUp() {
        this.activeTile1 = null;
        this.activeTile2 = null;
    }

    /**
     * Set the active tile and him position
     * @param tile
     * @param pointer
     */
    tileDown(tile, pointer) {
        if (this.canMove) {
            this.activeTile1 = tile;
            this.startPosI = tile.i;
            this.startPosJ = tile.j;
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
                            this.signals.tilesCrossOut.dispatch(tileGrid[i][j].tileType);
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
                            this.signals.tilesCrossOut.dispatch(tileGrid[i][j].tileType);
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
         return (this.tileGrid[col][row].tileType==type);
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
                    //@TODO здесь возможно шалит tileSizeAbsolute->tileSizeRelative
                    tempTile.i = i
                    tempTile.j = j
                    this.game.add.tween(tempTile).to({y: (this.tileSizeAbsolute * i) + (this.tileSizeAbsolute / 2)}, 500, Phaser.Easing.Bounce.Out, true);

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
                    this.tileGrid[i][j] = this.addTile(i, j, this.tileSizeAbsolute);
                }

            }
        }
    }

    /**
     * Return tile position
     * @param tileGrid
     * @param tile
     * @returns {{i: number, j: number}}
     */
    static getTilePos(tileGrid, tile) {
        let pos = {i: -1, j: -1};

        //Find the position of a specific tile in the grid
        for (let i = 0; i < tileGrid.length; i++) {
            for (let j = 0; j < tileGrid[i].length; j++) {
                //There is a match at this position so return the grid coords
                if (tile == tileGrid[i][j]) {
                    pos.i = tile.i;
                    pos.j = tile.j;
                    break;
                }
            }
        }

        return pos;
    }

    /**
     * Update GameField
     */
    update() {

        //The user is currently dragging from a tile, so let's see if they have dragged
        //over the top of an adjacent tile
        if (this.activeTile1 && !this.activeTile2) {

            //Get the location of where the pointer is currently
            let hoverX = this.game.input.x;
            let hoverY = this.game.input.y;

            //Figure out what position on the grid that translates to
            let hoverPosJ = Math.floor((hoverX - this.tiles.x) / this.tileSizeRelative);
            let hoverPosI = Math.floor((hoverY - this.tiles.y) / this.tileSizeRelative);

            //See if the user had dragged over to another position on the grid
            let difI = (hoverPosI - this.startPosI);
            let difJ = (hoverPosJ - this.startPosJ);

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
                        this.checkMatch();
                    });
                }

            }

        }
    }

    /**
     * Swap active tiles
     */
    swapTiles() {
        if (this.activeTile1) {
            // let tile1Pos = {
            //     x: (this.activeTile1.world.x - this.tileSizeRelative / 2) / this.tileSizeRelative,
            //     y: (this.activeTile1.world.y - this.tileSizeRelative / 2) / this.tileSizeRelative
            // };
            // let tile2Pos = {
            //     x: (this.activeTile2.world.x - this.tileSizeRelative / 2) / this.tileSizeRelative,
            //     y: (this.activeTile2.world.y - this.tileSizeRelative / 2) / this.tileSizeRelative
            // };


            //Swap them in our "theoretical" grid
            this.tileGrid[this.activeTile1.i][this.activeTile1.j] = this.activeTile2;
            this.tileGrid[this.activeTile2.i][this.activeTile2.j] = this.activeTile1;

            let i = this.activeTile1.i
            let j = this.activeTile1.j

            this.activeTile1.i = this.activeTile2.i
            this.activeTile1.j = this.activeTile2.j
            this.activeTile2.i = i
            this.activeTile2.j = j

            this.game.add.tween(this.activeTile1).to({
                x: this.activeTile2.x,
                y: this.activeTile2.y
            }, 200, Phaser.Easing.Linear.In, true);
            this.game.add.tween(this.activeTile2).to({
                x: this.activeTile1.x,
                y: this.activeTile1.y
            }, 200, Phaser.Easing.Linear.In, true);


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


            if(!this.lookForPossibles()){
                for (let i = 0; i < this.tileGrid.length; i++) {
                    for (let j = 0; j < this.tileGrid.length; j++) {
                        this.tileGrid[i][j]=null
                    }
                }
                this.tiles.callAll('kill');
                this.initTiles()
                this.game.time.events.add(600, () => {
                    this.checkMatch();
                });
            }
        }
    }

    /**
     * Create score label
     */
    createScore() {
        let scoreFont = "100px Arial";

        this.bestScoreLabel = this.game.add.responsiveText(0, 0, 'Best:'+this.game.userController.userInStorage.bestScore, {
            font: scoreFont,
            fill: "#4a2918"
        });
        this.bestScoreLabel.setPortraitScaling(10,false,false, Fabrique.PinnedPosition.bottomCenter)
        this.bestScoreLabel.anchor.setTo(0.5, 1);
        this.bestScoreLabel.align = 'center';

        this.scoreLabel = this.game.add.responsiveText(0, 0, "0", {
            font: scoreFont,
            fill: "#4a2918"
        });
        this.scoreLabel.setPortraitScaling(10,false,false, Fabrique.PinnedPosition.bottomCenter,0,-this.bestScoreLabel.height)
        this.scoreLabel.anchor.setTo(0.5, 1);
        this.scoreLabel.align = 'center';

    }

    /**
     * Increment user score
     */
    incrementScore() {
        if (this.gameType === 'infinity') {
            this.score += 1;
            this.scoreLabel.text = this.score;

            if (this.game.userController.userInStorage.bestScore < this.score) {
                this.bestScoreLabel.text = 'Best:'+this.score;
                this.game.userController.updateBestScoreInStorage(this.score)
            }
        }
    }
}