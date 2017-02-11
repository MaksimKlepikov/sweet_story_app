/**
 * Created by kevrat on 09.10.2016.
 */
class Login extends Phaser.State {
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
        let btnLogInVK = game.add.responsiveButton(0, 0,
            'main-vk', () => {
                this.logIn('vk');
            }, this
        );
        btnLogInVK.anchor.set(0.5)
        btnLogInVK.setPinned(Fabrique.PinnedPosition.middleCenter)
    }

    /**
     * Login via selected service
     * @param serviceName
     */
    logIn(serviceName) {
        console.log('Try to sign via ' + serviceName);
        switch (serviceName) {
            case 'vk': {
                if (game.server.connected) {
                    if (typeof cordova !== "undefined") {
                        console.log('open in app browser')
                        var iabRef = cordova.InAppBrowser.open(game.server.url + '/auth/vk/logIn', '_self', 'location=yes', 'toolbar=yes');//redirect to auth
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
                        window.location.href = game.server.url + '/auth/vk/logIn';
                    }
                }
                else {
                    let errorMsg = game.add.responsiveText(0, 0,
                        'нет соединения'
                    );
                    errorMsg.anchor.set(0.5, 1)
                    errorMsg.setPortraitScaling(50, true, true, Fabrique.PinnedPosition.bottomCenter, 0, 0);
                }
            }
                break;
        }
    }
}