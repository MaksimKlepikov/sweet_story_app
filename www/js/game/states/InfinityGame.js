/**
 * Created by kevrat on 08.10.2016.
 */
import ButtonLabel from '../gui/ButtonLabel'
import Header from '../gui/Header';

import GameField from '../GameField';

// import localforage from '../../../node_modules/localforage/dist/localforage'

export default class InfinityGame extends Phaser.State {
    /**
     * Create State
     */
    create() {
        // this.game.stage.smoothed = false;
        // this.game.createBtnBack('MainMenu')
        this.gui = {}
        this.gui.buttons = this.game.add.group();
        let btnBack = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-back', '',() => {
            this.gui.header.expand(this.game.height).onComplete.add(() => {
                this.game.state.start('MainMenu')
            })
        });
        btnBack.alignIn(this.game.camera.bounds, Phaser.BOTTOM_RIGHT)
        this.gui.buttons.add(btnBack);
        btnBack.activateInputsTweens();
        this.gameField = new GameField('infinity', null, this.game, 0, 0, 6, 6);
        this.gameField.alignIn(this.game.camera.bounds, Phaser.CENTER)
        this.gui.header = new Header(this.game, 0, -this.game.height * 0.5, 'main-header')

        this.game.add.existing(this.gui.header);
        // this.gui.header.reset();
        // btnBack.anchor.set(0.5)
        // this.header = this.game.createHeader(this.game.height);
        this.game.add.tween(this.gui.header).from({y: this.game.height * 1.5}, 250, Phaser.Easing.Sinusoidal.InOut, true)
            .onComplete.addOnce(_ => this.game.add.tween(this.gui.header).to({y: 0}, 250, Phaser.Easing.Back.Out, true));
        this.gui.header.inputEnabled = true;
        this.gui.header.events.onInputUp.add((header, pointer, isOver) => {
            if (isOver) {
                this.game.add.tween(this.gui.header)
                    .to({y: -this.game.height * 0.5}, 250, Phaser.Easing.Sinusoidal.In, true)
                    .onComplete.addOnce(_ => this.game.add.tween(this.gui.header).to({y: 0}, 250, Phaser.Easing.Back.Out, true))
            }
        });
        // this.game.add.sprite(200,100,'icons','lolipop2')

    }

    /**
     * Update State
     */
    update() {
        this.gameField.update();

    }

    render() {
        // this.game.debug.spriteBounds(this.gameField.tiles);
    }
}