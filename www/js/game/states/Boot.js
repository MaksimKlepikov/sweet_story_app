/**
 * Created by kevrat on 08.10.2016.
 */
import MainMenu from './MainMenu'
import Login from './Login'
import SelectLevel from './SelectLevel'
import Preload from './Preload'
import InfinityGame from './InfinityGame'
import Game from './Game'
import Server from '../Server'

export class Boot extends Phaser.State {
    /**
     * Preload State
     */
    preload() {
        // this.game.plugins.add(Fabrique.Plugins.Responsiveness);
        this.loadScripts();
        this.loadJSONs()
    }

    /**
     * Create State
     */
    create() {
        this.game.input.touch.preventDefault = false;
        this.addGameStates();
        this.scaleStage();
        if (typeof io != 'undefined') {
            this.game.server = new Server(this.game, 'http://sweetstory.herokuapp.com', io)
        }
        else {
            this.game.server = new Server(this.game, 'http://sweetstory.herokuapp.com')
        }

        this.game.state.start('Preload');
    }

    /**
     * Add loaded states to game
     */
    addGameStates() {
        this.game.state.add('MainMenu', MainMenu, false);
        this.game.state.add('Login', Login, false);
        this.game.state.add('SelectLevel', SelectLevel, false);
        this.game.state.add('Preload', Preload, false);
        this.game.state.add('InfinityGame', InfinityGame, false);
        this.game.state.add('Game', Game, false);
    }

    /**
     * Load scripts
     */
    loadScripts() {
        // this.game.load.script('Server', 'js/game/Server.js');
        // this.game.load.script('GameField', 'js/game/GameField.js');
        // this.game.load.script('UserController', 'js/game/controllers/UserController.js');
        // this.game.load.script('UserModel', 'js/game/models/UserModel.js');
        // this.loadStatesScripts()
    }
    /**
     * Load JSON files
     */
    loadJSONs() {
        this.game.load.json('hills', 'hills/hills.json');
    }

    /**
     * Scale game
     */
    scaleStage() {
        if (this.game.device.desktop) {
        }
        else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.forceOrientation(true, false);
            this.scale.refresh();
        }
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.scale.minWidth = Device.gameWidth / 2;
        this.scale.minHeight = Device.gameHeight / 2;
        this.scale.maxWidth = Device.gameWidth;
        this.scale.maxHeight = Device.gameHeight;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();

        if (this.scale.scaleMode == Phaser.ScaleManager.SHOW_ALL) {
            Device.viewX = (this.scale.width / 2 - window.innerWidth / 2) * this.scale.scaleFactor.x;
            Device.viewY = (this.scale.height / 2 - window.innerHeight / 2 - 1) * this.scale.scaleFactor.y;
            Device.viewWidth = Device.gameWidth - Device.viewX;
            Device.viewHeight = Device.gameHeight - Device.viewY;
        } else {
            Device.viewX = 0;
            Device.viewY = 0;
            Device.viewWidth = Device.gameWidth;
            Device.viewHeight = Device.gameHeight;
        }
    }
}
export class Device {
    constructor(game) {
        this._game = game;
        this._screen = 'small'
        this._srx = Math.max(window.innerWidth, window.innerHeight)
        this._sry = Math.min(window.innerWidth, window.innerHeight);
        this._logicWidth = 480;
        this._logicHeight = 320;
        this._viewX = {};
        this._viewY = {};
        this._viewWidth = {};
        this._viewHeight = {};
        let r = this._logicWidth / this._logicHeight;
        if (this._srx >= 360) {
            this._screen = "small";
            this._texturePrefix = 'hdpi/'
            this._gameWidth = 360;
        }
        if (this._srx >= 480) {
            this._screen = "normal";
            this._texturePrefix = 'xhdpi/'
            this._gameWidth = 480;
        }
        if (this._srx >= 720) {
            this._screen = "large";
            this._texturePrefix = 'xxhdpi/'
            this._gameWidth = 720;
        }
        if (this._srx >= 960) {
            this._screen = "xlarge";
            this._texturePrefix = 'xxxhdpi/'
            this._gameWidth = 960;
        }
        if (this._srx >= 1440) {
            this._screen = "xxlarge";
            this._texturePrefix = 'xxxhdpi/'
            this._gameWidth = 1440;
        }
        this._gameHeight = this._gameWidth / r;
        console.log(this._screen)
        // this._screen = "normal";
    }

    convertWidth(value) {
        return value / this.logicWidth * this._gameWidth;
    }

    convertHeight(value) {
        return value / this.logicHeight * this.gameHeight;
    }


    get texturePrefix() {
        return this._texturePrefix;
    }

    get game() {
        return this._game;
    }

    get screen() {
        return this._screen;
    }

    set screen(value) {
        this._screen = value;
    }


    get gameWidth() {
        return this._gameWidth;
    }

    set gameWidth(value) {
        this._gameWidth = value;
    }


    get srx() {
        return this._srx;
    }

    set srx(value) {
        this._srx = value;
    }

    get sry() {
        return this._sry;
    }

    set sry(value) {
        this._sry = value;
    }

    get logicWidth() {
        return this._logicWidth;
    }

    set logicWidth(value) {
        this._logicWidth = value;
    }

    get logicHeight() {
        return this._logicHeight;
    }

    set logicHeight(value) {
        this._logicHeight = value;
    }

    get gameHeight() {
        return this._gameHeight;
    }

    set gameHeight(value) {
        this._gameHeight = value;
    }


    get viewX() {
        return this._viewX;
    }

    set viewX(value) {
        this._viewX = value;
    }

    get viewY() {
        return this._viewY;
    }

    set viewY(value) {
        this._viewY = value;
    }

    get viewWidth() {
        return this._viewWidth;
    }

    set viewWidth(value) {
        this._viewWidth = value;
    }

    get viewHeight() {
        return this._viewHeight;
    }

    set viewHeight(value) {
        this._viewHeight = value;
    }
}

// var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'sweetstory', null, true);
// game.user = {};
// if (game.device.desktop) {
//     Device.screen = "large";
//     Device.gameWidth = 720;
// }
// Device.gameHeight = Device.gameWidth / r;
// game.width = Device.gameWidth
// game.height = Device.gameHeight
