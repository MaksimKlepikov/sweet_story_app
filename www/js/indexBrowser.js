/**
 * Created by kevrat on 02.12.2016.
 */
import {Boot, Device} from './game/states/Boot'
window.onload = function () {

    class Game extends Phaser.Game {

        constructor() {
            super('100%', '100%', Phaser.AUTO, 'sweetstory', null, true, false);
            this.state.add('Boot', Boot, false);
            this.state.start('Boot');
            this.user = {};
            // if (this.device.desktop) {
            //     BasicGame.screen = "large";
            //     BasicGame.gameWidth = 720;
            // }
            // BasicGame.gameHeight = BasicGame.gameWidth / r;
            // this.width = BasicGame.gameWidth
            // this.height = BasicGame.gameHeight
        }

    }
    var game = new Game();
    // game.state.add('Boot', Boot);
    // game.state.start('Boot');
}