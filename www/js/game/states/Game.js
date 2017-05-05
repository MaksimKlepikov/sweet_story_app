/**
 * Created by kevrat on 24.12.2016.
 */
import ButtonLabel from '../gui/ButtonLabel'
import Header from '../gui/Header';
import ProgressWidget from '../gui/ProgressWidget';

import GameField from '../GameField';
export default class Game extends Phaser.State {
    /**
     * Init State
     * @param hill - current level
     */
    init(hill) {
        this.currentLevel = hill
    }

    /**
     * Create State
     */
    create() {
        this.createSignals();
        this.gui = {};
        this.gui.buttons = this.game.add.group();
        let btnBack = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-back', '', () => {
            // this.gui.header.expand(this.game.height).onComplete.add(() => {
            //     this.game.state.start('MainMenu')
            // })
            this.game.state.start('SelectLevel')
        });
        btnBack.alignIn(this.game.camera.bounds, Phaser.BOTTOM_RIGHT);
        this.gui.buttons.add(btnBack);
        btnBack.activateInputsTweens();
        this.gameField = new GameField('sweetHill', this.currentLevel, this.game, 0, 0, 6, 6);
        this.bindGameFieldSignals();
        this.gameField.alignIn(this.game.camera.bounds, Phaser.RIGHT_CENTER);
        this.createProgressWidget();
        this.createMovesLabel();
        // this.createAwardWindow('bronze');
    }

    /**
     * Update State
     */
    update() {
        this.gameField.update();
    }

    /**
     * Create signals
     */
    createSignals() {
        this.signals = {}
        this.signals.isProgress = new Phaser.Signal();
        this.signals.levelDone = new Phaser.Signal();
        this.signals.startSelectLevel = new Phaser.Signal();
        this.signals.startSelectLevel.add((btnAccept) => {
            this.game.add.tween(btnAccept).to({y: -btnAccept.height}, 1000, Phaser.Easing.Back.In, true)
                .onComplete.add(() => this.game.state.start('SelectLevel'))
        });

        this.signals.levelDone.add((result) => {
            // this.game.userController.incrementLevel();
            this.game.userController.updateProgress();
            this.createAwardWindow(result);
        });
    }

    bindGameFieldSignals(){
        this.gameField.signals.playerMove.add(()=>{
            this.movesLabel.text = 'Moves: ' + (this.currentLevel.moves - this.gameField.moves)
        })
    }

    createMovesLabel(){
        let movesFont = "50px Arial";
        this.movesLabel = this.game.add.text(0, 0, 'Moves: ' + (this.currentLevel.moves - this.gameField.moves), {
            font: movesFont,
            fill: "#4a2918"
        });

        this.movesLabel.alignIn(this.game.camera.bounds, Phaser.TOP_CENTER);
    }

    /**
     * Create award window
     */
    createAwardWindow(result) {
        // let btnAccept = this.game.createBtnLabel('Далее', 'main-button',
        //     Fabrique.PinnedPosition.topCenter,
        //     () => {
        //         this.signals.startSelectLevel.dispatch(btnAccept)
        //     }, 90)
        // this.game.add.tween(btnAccept).to({y: this.game.height - btnAccept.height}, 1000, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
        let awardWindow = this.game.add.sprite(0, 0, 'assets', 'panel');
        let starPanels = this.game.add.group();
        let starPanelsArray = starPanels.createMultiple(3, 'assets', 'star-panel', true);
        let headerLinePanel = this.game.add.sprite(0, 0, 'assets', 'header-line-panel');
        // awardWindow.addChild(headerLinePanel);

        let starBronze = this.game.add.sprite(0, 0, 'assets', 'star-bronze');
        starBronze.anchor.setTo(0.5)
        starPanelsArray[1].addChild(starBronze);
        starBronze.alignIn(starPanelsArray[1], Phaser.CENTER);
        starBronze.visible = false;

        let starSilver = this.game.add.sprite(0, 0, 'assets', 'star-silver');
        starSilver.anchor.setTo(0.5)
        starPanelsArray[2].addChild(starSilver);
        starSilver.alignIn(starPanelsArray[2], Phaser.CENTER);
        starSilver.visible = false;

        let starGold = this.game.add.sprite(0, 0, 'assets', 'star-gold');
        starGold.anchor.setTo(0.5)
        starPanelsArray[0].addChild(starGold);
        starGold.alignIn(starPanelsArray[0], Phaser.CENTER);
        starGold.visible = false;

        starPanelsArray[0].alignIn(awardWindow, Phaser.TOP_CENTER, 0, -starPanelsArray[0].height / 5);
        starPanelsArray[1].alignTo(starPanelsArray[0], Phaser.BOTTOM_LEFT, starPanelsArray[0].width, -starPanelsArray[0].width / 2);
        starPanelsArray[2].alignTo(starPanelsArray[0], Phaser.BOTTOM_RIGHT, starPanelsArray[0].width, -starPanelsArray[0].width / 2);
        awardWindow.addChild(starPanels);
        // starPanels.alignIn(awardWindow, Phaser.CENTER);

        let btns = this.game.add.group();
        awardWindow.addChild(btns)
        let btnMainMenu = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-home', '', () => {
            // this.gui.header.expand(this.game.height).onComplete.add(() => {
            //     this.game.state.start('MainMenu')
            // })
            this.game.state.start('MainMenu')
        });
        btnMainMenu.activateInputsTweens();

        let btnReplay = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-reload', '', () => {
            // this.gui.header.expand(this.game.height).onComplete.add(() => {
            //     this.game.state.start('MainMenu')
            // })
            this.game.state.start('MainMenu')
        });
        btnReplay.activateInputsTweens();

        let btnNext = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-play', '', () => {
            // this.gui.header.expand(this.game.height).onComplete.add(() => {
            //     this.game.state.start('MainMenu')
            // })
            this.game.state.start('MainMenu')
        });
        btnNext.activateInputsTweens();

        btns.addMultiple([btnMainMenu, btnReplay, btnNext]);
        btns.align(3, 1,
            this.game.cache.getFrameByName('assets', 'btn-reload').width,
            this.game.cache.getFrameByName('assets', 'btn-reload').height
        );
        btns.alignIn(awardWindow, Phaser.BOTTOM_CENTER, 0, -this.game.cache.getFrameByName('assets', 'btn-reload').height/2);

        awardWindow.alignIn(this.game.camera.bounds, Phaser.CENTER);
        headerLinePanel.alignTo(awardWindow, Phaser.TOP_CENTER, 0, -headerLinePanel.height / 2);
        this.game.add.tween(headerLinePanel).from({y: -awardWindow.height}, 1100, Phaser.Easing.Back.InOut, true)//.onComplete.add(callback)
        let awardWindowTween = this.game.add.tween(awardWindow).from({y: -awardWindow.height}, 1000, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)

        if (result === 'bronze' || result === 'silver' || result === 'gold') {
            awardWindowTween.onComplete.add(() => {
                starBronze.visible = true;
                this.game.add.tween(starBronze.scale).from({x: 0, y: 0}, 500, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
            })
        }
        if (result === 'silver' || result === 'gold') {
            awardWindowTween.onComplete.add(() => {
                setTimeout(() => {
                    starSilver.visible = true;
                    this.game.add.tween(starSilver.scale).from({x: 0, y: 0}, 500, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
                }, 250);
            })
        }
        if (result === 'gold') {
            awardWindowTween.onComplete.add(() => {
                setTimeout(() => {
                    starGold.visible = true;
                    this.game.add.tween(starGold.scale).from({x: 0, y: 0}, 1000, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
                }, 500);
            })
        }
        if (result === 'bronze' || result === 'silver' || result === 'gold') {

        }



    }

    /**
     * Create progress widget
     */
    createProgressWidget(result) {
        this.gui.progressWidget = new ProgressWidget(this.game, this.currentLevel, this.game.height * 0.9);
        this.game.add.existing(this.gui.progressWidget);

        this.gui.progressWidget.alignIn(this.game.camera.bounds, Phaser.LEFT_CENTER, -this.game.cache.getFrameByName('assets', 'lolipop2').width)
    }
}