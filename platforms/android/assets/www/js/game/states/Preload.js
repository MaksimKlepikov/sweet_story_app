/**
 * Created by kevrat on 30.10.2016.
 */
var Preload = function () {
};
Preload.prototype = {
    /**
     * Preload State
     */
    preload: function () {
        this.loadImages();
    },

    /**
     * Create State
     */
    create: function () {
        this.game.userController = new UserController(this.game,
            new UserModel(window.localStorage)
        )
        console.log(this.game.server)
        if (this.game.server.connect()) {
            console.log('io is ok')
        }
        else {
            console.log('io is not ok')
            if (!this.game.userController.userInStorage) {
                console.log('need to login')
                this.game.state.start('Login')
            }
            else {
                this.game.userController.syncUser()
                this.game.state.start('MainMenu');
            }
        }
    },

    /**
     * Load images
     */
    loadImages: function () {
        game.load.atlasJSONHash('icons', 'img/' + BasicGame.screen + '/icons/icons.png', 'img/' + BasicGame.screen + '/icons/icons.json');

        console.log('Screen: ' + BasicGame.screen)
        game.load.image('main-bg', 'img/' + BasicGame.screen + '/bg/main-bg.png');
        game.load.image('main-header', 'img/' + BasicGame.screen + '/bg/main-header.png');
        game.load.image('main-button', 'img/' + BasicGame.screen + '/buttons/main-button.png');
        game.load.image('main-menu', 'img/' + BasicGame.screen + '/buttons/main-menu.png');
        game.load.image('main-play', 'img/' + BasicGame.screen + '/buttons/main-play.png');
        game.load.image('main-vk', 'img/' + BasicGame.screen + '/buttons/main-vk.png');
    },

}