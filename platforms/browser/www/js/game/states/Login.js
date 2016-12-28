/**
 * Created by kevrat on 09.10.2016.
 */
var Login = function () {
};
Login.prototype = {
    preload: function () {

    },
    create: function () {
        this.createIcons();
        console.log('login')
    },
    update: function () {

    },
    render: function () {
    },
    createIcons: function () {
        let btnsAuth = game.add.responsiveGroup();
        let btnLogInVK = game.add.responsiveButton(0, 0,
            'main-vk', () => {
                this.logIn('vk');
            }, this
        );
        // btnsAuth.add(btnLogInVK);

        // btnLogInVK.inputEnabled = true;
        // btnLogInVK.anchor.set(0.5);
        // btnLogInVK.setPortraitScaling(20, false, false, Fabrique.PinnedPosition.middleCenter);
    },
    logIn: function (serviceName) {
        console.log('Try to sign via ' + serviceName);
        switch (serviceName) {
            case 'vk': {
                if (game.server.connected) {
                    if (typeof cordova !== "undefined") {
                        // console.log('open in app browser')
                        // var iabRef = cordova.InAppBrowser.open(game.server.url + '/auth/vk/logIn', '_blank', 'location=yes', 'toolbar=yes');//redirect to auth
                        // iabRef.addEventListener('loadstart', function (event) {
                        //     if (event.url.match("successfulLogIn")) {
                        //         console.log('successfulLogIn')
                        //         iabRef.close();//back to app
                        //     }
                        // });

                        console.log('open in app browser')
                        // var iabRef = window.inAppBrowserXwalk.open(game.server.url + '/auth/vk/logIn');//redirect to auth
                        // iabRef.addEventListener('loadstart', function (event) {
                        //     if (event.url.match("successfulLogIn")) {
                        //         console.log('successfulLogIn')
                        //         iabRef.close();//back to app
                        //     }
                        // });
                        var browser = window.inAppBrowserXwalk.open(game.server.url + '/auth/vk/logIn');

                        browser.addEventListener("loadstart", function (url) {
                            console.log(url);
                        });

                        browser.addEventListener("loadstop", function (url) {
                            console.log(url);
                        });

                        browser.addEventListener("exit", function () {
                            console.log("browser closed");
                        });
                        // if( window.cordova && cordova.platformId === "android" ) {
                        // }
                        // else {
                        //     window.open("http://shoety.de", "_blank");
                        // }
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

    },
}