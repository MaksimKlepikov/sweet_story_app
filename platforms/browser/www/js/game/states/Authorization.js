/**
 * Created by kevrat on 09.10.2016.
 */

var Authorization = function () {
};
Authorization.prototype = {
    preload: function () {

    },
    create: function () {
        this.createButtons();
        this.createGUI();
        // Appodeal.isLoaded(Appodeal.BANNER, function(result){
        //     Appodeal.show(Appodeal.BANNER_TOP);
        // });
    },
    update: function () {
    },
    createButtons: function () {
        this.buttonsAuth = game.add.responsiveGroup();

        let btnLogIn = game.add.responsiveButton(game.world.centerX, (game.world.centerY/4)*3,
            'buttons',
            this.signIn,
            this,
        );
        this.btnSignIn.setLandscapeScaling(20, false, false, Fabrique.PinnedPosition.middleCenter, 0, -100);
        this.btnSignIn.setPortraitScaling(20, false, false, Fabrique.PinnedPosition.middleCenter, 0, -100);

        this.btnSignUp.setLandscapeScaling(20, false, false, Fabrique.PinnedPosition.middleCenter, 0, 100);
        this.btnSignUp.setPortraitScaling(20, false, false, Fabrique.PinnedPosition.middleCenter, 0, 100);

        this.btnSignIn.anchor.set(0.5,0.5);
        this.btnSignUp.anchor.set(0.5,0.5);
    },
    signIn: function () {
        // game.state.start('Login',Phaser.Plugin.StateTransition.Out.SlideLeft, Phaser.Plugin.StateTransition.In.SlideLeft);
        game.state.start('Login');
    },
    signUp: function () {
        game.state.start('Registration');
    },
}
