/**
 * Created by kevrat on 08.10.2016.
 */
var BasicGame = {};
BasicGame.screen = "small";
BasicGame.srx = Math.max(window.innerWidth,window.innerHeight);
BasicGame.sry = Math.min(window.innerWidth,window.innerHeight);

BasicGame.logicWidth = 480;
BasicGame.logicHeight = 320;
var r = BasicGame.logicWidth/BasicGame.logicHeight;
if(BasicGame.srx >= 360){
    BasicGame.screen = "small";
    BasicGame.gameWidth = 360;
}
if(BasicGame.srx >= 480){
    BasicGame.screen = "normal";
    BasicGame.gameWidth = 480;
}
if(BasicGame.srx >= 720){
    BasicGame.screen = "large";
    BasicGame.gameWidth = 720;
}
if(BasicGame.srx >= 960){
    BasicGame.screen = "xlarge";
    BasicGame.gameWidth = 960;
}
if(BasicGame.srx >= 1440){
    BasicGame.screen = "xxlarge";
    BasicGame.gameWidth = 1440;
}

// If on deskop, we may need to fix the maximum resolution instead of scaling the game to the full monitor resolution
// var device = new Phaser.Device();
// if(Phaser.device.desktop){
//     BasicGame.screen = "large";
//     BasicGame.gameWidth = 720;
// }
device = null;


BasicGame.gameHeight = BasicGame.gameWidth/r;
//We need these methods later to convert the logical game position to display position, So convertWidth(logicWidth) will be right edge for all screens
BasicGame.screen = "normal";
BasicGame.convertWidth = function(value){
    return value/BasicGame.logicWidth * BasicGame.gameWidth;
};
BasicGame.convertHeight = function(value){
    return value/BasicGame.logicHeight * BasicGame.gameHeight;
};

// var game = new Phaser.Game('100%','100%', Phaser.CANVAS, 'math3',null,true);
// var game = new Phaser.Game(BasicGame.gameWidth,BasicGame.gameHeight, Phaser.CANVAS, 'match3',null,false);
var game = new Phaser.Game('100%','100%', Phaser.AUTO, 'cafemaster',null,true);
game.user = {};
if(game.device.desktop){
    BasicGame.screen = "large";
    BasicGame.gameWidth = 720;
}
BasicGame.gameHeight = BasicGame.gameWidth/r;
game.width = BasicGame.gameWidth
game.height = BasicGame.gameHeight
var Boot = function (game) {};
// var game = new Phaser.Game('100%', '100%', Phaser.CANVAS, 'cafemaster',null,true);


Boot.prototype = {
    init:function(){

    },

    preload: function () {
        // game.plugins.add(Fabrique.Plugins.InputField);
        game.plugins.add(Fabrique.Plugins.Responsiveness);
        this.loadScripts();
        this.loadJSONs()
    },

    create: function () {
        // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.addGameStates();
        this.scaleStage();
        // this.game.server = new Server('http://sweetstory.herokuapp.com', io)
        if(typeof io != 'undefined'){
            this.game.server = new Server(this.game,'http://sweetstory.herokuapp.com', io)
        }
        else{
            this.game.server = new Server(this.game,'http://sweetstory.herokuapp.com')
        }

        // game.stage.backgroundColor = "#ffffff";

        game.state.start('Preload');
    },
    addGameStates: function () {
        game.state.add('MainMenu', MainMenu);
        // game.state.add("Registration",Registration);
        game.state.add('Login', Login);
        game.state.add('SelectLevel', SelectLevel);
        game.state.add('Preload', Preload);
        game.state.add('InfinityGame', InfinityGame);
        game.state.add('Game', Game);
    },
    loadScripts:function () {
        game.load.script('Server', 'js/game/Server.js');
        game.load.script('GameField', 'js/game/GameField.js');
        game.load.script('UserController', 'js/game/controllers/UserController.js');
        game.load.script('UserModel', 'js/game/models/UserModel.js');
        this.loadStatesScripts()
    },
    loadStatesScripts:function () {
        let statesScripts = [
            {name:'MainMenu',      uri:'js/game/states/MainMenu.js'},
            {name:'Preload',       uri:'js/game/states/Preload.js'},
            {name:'Login',         uri:'js/game/states/Login.js'},
            {name:'InfinityGame',  uri:'js/game/states/InfinityGame.js'},
            {name:'SelectLevel',   uri:'js/game/states/SelectLevel.js'},
            {name:'Game',          uri:'js/game/states/Game.js'},
            // // {name:'Profile',       uri:'game/states/StateProfile.js'},
            // // {name:'Friends',       uri:'game/states/StateFriends.js'},
            // {name:'Game',          uri:'game/states/StateGame/StateGame.js'},
        ];
        for (let i = 0; i < statesScripts.length; i++) {
            game.load.script(statesScripts[i].name, statesScripts[i].uri);
        }
    },
    loadJSONs:function () {
        game.load.json('hills', 'hills/hills.json');
    },
    scaleStage:function(){
        if (this.game.device.desktop)
        {
            // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            // // console.log(BasicGame.gameWidth/r);
            // // this.scale.minWidth = BasicGame.gameWidth/2;
            // // this.scale.minHeight = BasicGame.gameHeight/2;
            // // this.scale.maxWidth = 720;
            // // this.scale.maxHeight = 720/r;
            // // this.scale.minWidth = 720
            // // this.scale.maxWidth = 720
            // this.scale.pageAlignHorizontally = true;
            // this.scale.pageAlignVertically = true;
            // this.scale.refresh();
        }
        else
        {
            this.scale.scaleMode = Phaser.ScaleManager.NO_BORDER;
            this.scale.forceOrientation(true, false);
            this.scale.refresh();
        }

        this.scale.minWidth = BasicGame.gameWidth/2;
        this.scale.minHeight = BasicGame.gameHeight/2;
        this.scale.maxWidth = BasicGame.gameWidth;
        this.scale.maxHeight = BasicGame.gameHeight;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.refresh();

        if(this.scale.scaleMode==Phaser.ScaleManager.NO_BORDER){
            BasicGame.viewX = (this.scale.width/2 - window.innerWidth/2)*this.scale.scaleFactor.x;
            BasicGame.viewY = (this.scale.height/2 - window.innerHeight/2 - 1)*this.scale.scaleFactor.y;
            BasicGame.viewWidth = BasicGame.gameWidth-BasicGame.viewX;
            BasicGame.viewHeight = BasicGame.gameHeight-BasicGame.viewY;
        }else{
            BasicGame.viewX = 0;
            BasicGame.viewY = 0;
            BasicGame.viewWidth = BasicGame.gameWidth;
            BasicGame.viewHeight = BasicGame.gameHeight;
        }

        // document.getElementById("match3").style.width = window.innerWidth+"px";
        // document.getElementById("match3").style.height = window.innerHeight-1+"px";//The css for body includes 1px top margin, I believe this is the cause for this -1
        // document.getElementById("match3").style.overflow = "hidden";
    },


};