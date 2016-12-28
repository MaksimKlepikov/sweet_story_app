/**
 * Created by kevrat on 08.10.2016.
 */
var Boot = function (game) {
};
Boot.prototype = {
    /**
     * Preload State
     */
    preload: function () {
        game.plugins.add(Fabrique.Plugins.Responsiveness);
        this.loadScripts();
        this.loadJSONs()
    },

    /**
     * Create State
     */
    create: function () {
        game.input.touch.preventDefault = false;
        this.addGameStates();
        this.scaleStage();
        if (typeof io != 'undefined') {
            this.game.server = new Server(this.game, 'http://sweetstory.herokuapp.com', io)
        }
        else {
            this.game.server = new Server(this.game, 'http://sweetstory.herokuapp.com')
        }

        game.state.start('Preload');
    },

    /**
     * Add loaded states to game
     */
    addGameStates: function () {
        game.state.add('MainMenu', MainMenu);
        game.state.add('Login', Login);
        game.state.add('SelectLevel', SelectLevel);
        game.state.add('Preload', Preload);
        game.state.add('InfinityGame', InfinityGame);
        game.state.add('Game', Game);
    },

    /**
     * Load scripts
     */
    loadScripts: function () {
        game.load.script('Server', 'js/game/Server.js');
        game.load.script('GameField', 'js/game/GameField.js');
        game.load.script('UserController', 'js/game/controllers/UserController.js');
        game.load.script('UserModel', 'js/game/models/UserModel.js');
        this.loadStatesScripts()
    },

    /**
     * Load states scripts
     */
    loadStatesScripts: function () {
        let statesScripts = [
            {name: 'MainMenu', uri: 'js/game/states/MainMenu.js'},
            {name: 'Preload', uri: 'js/game/states/Preload.js'},
            {name: 'Login', uri: 'js/game/states/Login.js'},
            {name: 'InfinityGame', uri: 'js/game/states/InfinityGame.js'},
            {name: 'SelectLevel', uri: 'js/game/states/SelectLevel.js'},
            {name: 'Game', uri: 'js/game/states/Game.js'},
        ];
        for (let i = 0; i < statesScripts.length; i++) {
            game.load.script(statesScripts[i].name, statesScripts[i].uri);
        }
    },

    /**
     * Load JSON files
     */
    loadJSONs: function () {
        game.load.json('hills', 'hills/hills.json');
    },

    /**
     * Scale game
     */
    scaleStage: function () {
        if (this.game.device.desktop) {
        }
        else {
            this.scale.scaleMode = Phaser.ScaleManager.NO_BORDER;
            this.scale.forceOrientation(true, false);
            this.scale.refresh();
        }

        this.scale.minWidth = BasicGame.gameWidth / 2;
        this.scale.minHeight = BasicGame.gameHeight / 2;
        this.scale.maxWidth = BasicGame.gameWidth;
        this.scale.maxHeight = BasicGame.gameHeight;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();

        if (this.scale.scaleMode == Phaser.ScaleManager.NO_BORDER) {
            BasicGame.viewX = (this.scale.width / 2 - window.innerWidth / 2) * this.scale.scaleFactor.x;
            BasicGame.viewY = (this.scale.height / 2 - window.innerHeight / 2 - 1) * this.scale.scaleFactor.y;
            BasicGame.viewWidth = BasicGame.gameWidth - BasicGame.viewX;
            BasicGame.viewHeight = BasicGame.gameHeight - BasicGame.viewY;
        } else {
            BasicGame.viewX = 0;
            BasicGame.viewY = 0;
            BasicGame.viewWidth = BasicGame.gameWidth;
            BasicGame.viewHeight = BasicGame.gameHeight;
        }
    },

};
var BasicGame = {};
BasicGame.screen = "small";
BasicGame.srx = Math.max(window.innerWidth, window.innerHeight);
BasicGame.sry = Math.min(window.innerWidth, window.innerHeight);

BasicGame.logicWidth = 480;
BasicGame.logicHeight = 320;
var r = BasicGame.logicWidth / BasicGame.logicHeight;
if (BasicGame.srx >= 360) {
    BasicGame.screen = "small";
    BasicGame.gameWidth = 360;
}
if (BasicGame.srx >= 480) {
    BasicGame.screen = "normal";
    BasicGame.gameWidth = 480;
}
if (BasicGame.srx >= 720) {
    BasicGame.screen = "large";
    BasicGame.gameWidth = 720;
}
if (BasicGame.srx >= 960) {
    BasicGame.screen = "xlarge";
    BasicGame.gameWidth = 960;
}
if (BasicGame.srx >= 1440) {
    BasicGame.screen = "xxlarge";
    BasicGame.gameWidth = 1440;
}
device = null;


BasicGame.gameHeight = BasicGame.gameWidth / r;
BasicGame.screen = "normal";
BasicGame.convertWidth = function (value) {
    return value / BasicGame.logicWidth * BasicGame.gameWidth;
};
BasicGame.convertHeight = function (value) {
    return value / BasicGame.logicHeight * BasicGame.gameHeight;
};

var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'sweetstory', null, true);
game.user = {};
if (game.device.desktop) {
    BasicGame.screen = "large";
    BasicGame.gameWidth = 720;
}
BasicGame.gameHeight = BasicGame.gameWidth / r;
game.width = BasicGame.gameWidth
game.height = BasicGame.gameHeight