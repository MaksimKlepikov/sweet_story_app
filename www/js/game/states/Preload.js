/**
 * Created by kevrat on 30.10.2016.
 */
import Header from '../gui/Header';
import {Device} from './Boot';
import MainMenu from './MainMenu';
import ButtonLabel from '../gui/ButtonLabel'
import UserController from '../controllers/UserController'
import UserModel from '../models/UserModel'

export default class Preload extends Phaser.State {
    /**
     * Preload State
     */
    preload() {
        this.loadImages();
    }

    /**
     * Create State
     */
    create() {
        this.game.userController = new UserController(this.game,
            new UserModel(localforage)
        )
        console.log(this.game.server)
        this.game.userController.userInStorage.then((userInStorage) => {

            if (this.game.server.connect()) {
                console.log('connected to server');
                if(!userInStorage){
                    console.log('user not found in cache');
                    this.game.state.start('Login')
                }
            }
            else {
                console.log('io is not ok')
                this.game.userController.userInStorage.then((userInStorage) => {
                    if (!userInStorage) {
                        console.log('need to login')
                        this.game.state.start('Login')
                    }
                    else {
                        this.game.userController.syncUser().then(() => {
                            this.game.state.start('MainMenu');
                        })
                    }
                })
            }
        })
        // this.game.state.start('MainMenu');
    }

    /**
     * Load images
     */
    loadImages() {
        let device = new Device(this.game)
        this.game.load.atlasJSONHash('assets', 'img/' + device.screen + '/assets.png', 'img/' + device.screen + '/assets.json');

        console.log('Screen: ' + device.screen)
        this.game.load.image('main-bg', 'img/' + device.screen + '/bg/main-bg.png');
        this.game.load.image('main-header', 'img/' + device.screen + '/bg/main-header.png');
        this.game.load.image('main-vk', 'img/' + device.screen + '/buttons/main-vk.png');
    }
}