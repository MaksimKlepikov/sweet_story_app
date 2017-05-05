/**
 * Created by kevrat on 09.10.2016.
 */
import ButtonLabel from '../gui/ButtonLabel'

export default class Login extends Phaser.State {
    /**
     * Create State
     */
    create() {
        this.createIcons();
    }

    /**
     * Create login icons
     */
    createIcons() {
        this.gui = {};
        this.gui.buttons = this.game.add.group();
        let btnLogInVK = this.game.add.button(0,0, 'main-vk', () => this.logIn('vk'))
        this.gui.buttons.add(btnLogInVK);
        btnLogInVK = this.game.add.button(0,0, 'main-vk', () => this.logIn('vk'))
        this.gui.buttons.add(btnLogInVK);
        this.gui.buttons.align(2, 1, this.game.width/2, this.game.width/2, Phaser.CENTER);
        this.gui.buttons.alignIn(this.game.camera.bounds, Phaser.CENTER)
    }

    /**
     * Login via selected service
     * @param serviceName
     */
    logIn(serviceName) {
        console.log('Try to sign via ' + serviceName);
        switch (serviceName) {
            case 'vk': {
                if (this.game.server.connected) {
                    if (typeof cordova !== "undefined") {
                        console.log('open in app browser')
                        var iabRef = cordova.InAppBrowser.open(this.game.server.url + '/auth/vk/logIn', '_self', 'location=yes', 'toolbar=yes');//redirect to auth
                        iabRef.addEventListener('loadstart', (event) => {
                            if (event.url.match("successfulLogIn")) {
                                console.log('successfulLogIn')
                                iabRef.hide();//back to app
                                this.game.state.start('MainMenu');
                            }
                        });
                    }
                    else {
                        console.log('change url')
                        window.location.href = this.game.server.url + '/auth/vk/logIn';
                    }
                }
                else {
                    let errorMsg = this.game.add.text(0, 0,
                        'нет соединения'
                    );
                    errorMsg.alignIn(this.game.camera.bounds, Phaser.BOTTOM_CENTER)
                    // errorMsg.anchor.set(0.5, 1)
                    // errorMsg.setPortraitScaling(50, true, true, Fabrique.PinnedPosition.bottomCenter, 0, 0);
                }
            }
                break;
        }
    }
}