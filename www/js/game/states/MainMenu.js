/**
 * Create and return button, what start state
 * @param stateName - name of start state
 * @returns {Fabrique.ResponsiveButton} - button
 */
// game.createBtnBack = function (stateName) {
//     let btnBackToMenu = game.add.responsiveButton(0, 0, 'main-menu', () => game.state.start(stateName), this)
//     btnBackToMenu.setPortraitScaling(10, true, true, Fabrique.PinnedPosition.bottomLeft)
//     btnBackToMenu.anchor.set(0, 1)
//     return btnBackToMenu
// };
// game.Btn = Btn

import ButtonLabel from '../gui/ButtonLabel'
import Header from '../gui/Header';

export default class MainMenu extends Phaser.State {
    /**
     * Create State
     */
    create() {
        this.signals = {}
        this.signals.startInfinityGame = new Phaser.Signal();
        this.signals.startSelectLevel = new Phaser.Signal();
        this.signals.showRecordBoard = new Phaser.Signal();
        this.signals.startSelectLevel.add(() => {
            this.expandHeader(() => {
                this.game.state.start('SelectLevel')
            })
        });
        this.signals.showRecordBoard.add(() => {
            this.expandHeader(() => {
                this.resetHeader(() => console.log(2));
                // this.createRecordBoard()
            })
        });
        this.signals.startInfinityGame.add(() => {
            this.expandHeader(() => {
                this.game.state.start('InfinityGame')
            })
        });
        this.gui = {};
        this.createBtns();
        this.gui.header = new Header(this.game, 0, -this.game.height * 0.5, 'main-header');
        this.game.add.existing(this.gui.header);
        this.gui.header.inputEnabled = true;
        this.game.add.tween(this.gui.header).from({y: this.game.height * 1.5}, 250, Phaser.Easing.Sinusoidal.In, true)
            .onComplete.addOnce(_ => this.game.add.tween(this.gui.header).to({y: 0}, 250, Phaser.Easing.Back.Out, true)
            .onComplete.addOnce(_ => this.game.add.tween(this.gui.header).to({y: -this.gui.header.getBounds().height*0.2}, 2000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true)))
        this.gui.header.events.onInputUp.add((header, pointer, isOver) => {
            if (isOver) {
                this.game.add.tween(this.gui.header)
                    .to({y: -this.game.height * 0.5}, 250, Phaser.Easing.Sinusoidal.In, true)
                    .onComplete.addOnce(_ => this.game.add.tween(this.gui.header).to({y: 0}, 250, Phaser.Easing.Back.Out, true))
            }
        });
        this.game.add.tween(this.gui.header.tilePosition).to({x: this.gui.header.width}, 10000, null, true, 0, -1)


    }

    /**
     * Start header expand animation
     * @param callback
     */
    expandHeader(callback) {
        this.gui.header.expand().onComplete.add(callback)
    }

    /**
     * Start reset header animation
     * @param callback
     */
    resetHeader(callback) {
        this.gui.header.reset().onComplete.add(callback)
    }

    /**
     * Create buttons
     */
    createBtns() {
        let bg = this.game.add.sprite(0, 0, 'main-bg');
        bg.width = this.game.width
        bg.scale.y = bg.scale.x;

        let btnSelectLevel = new ButtonLabel(
            this.game, 0, 0, 'assets', 'btn-main-play', '', () => this.signals.startSelectLevel.dispatch(),
            // {width:0.8, maxWidth:250, leftPadding: 0.4, bottomPadding: 0.1}
        )

        let btnInfinityGame = new ButtonLabel(
            this.game, 0, 0, 'assets', 'btn-main-record', '', () => this.signals.startInfinityGame.dispatch(),
            // {width:0.8, maxWidth:250, leftPadding: 0.4, bottomPadding: 0.1}
        )

        // let btnShowRecordBoard = new ButtonLabel(
        //     this.game, 0, 0, 'assets', 'btn-main', 'Лидеры', () => this.signals.showRecordBoard.dispatch(),
        //     // {width:0.8, maxWidth:250, leftPadding: 0.4, bottomPadding: 0.1}
        // )

        this.gui.buttons = this.game.add.group();
        this.gui.buttons.addMultiple([btnSelectLevel, btnInfinityGame])
        this.gui.buttons.align(1, this.gui.buttons.children.length, btnSelectLevel.width, btnSelectLevel.height * 1.1);
        this.gui.buttons.alignIn(this.game.camera.bounds, Phaser.BOTTOM_CENTER, 0, -btnSelectLevel.height * 0.5)

        this.gui.buttons.forEach(btn => btn.activateInputsTweens());
    }

    /**
     * Create background
     */
    createBg() {
    }

    /**
     * Create board of records
     */
    createRecordBoard() {

        if (this.game.server.connected) {

            this.mainButtons.setAll('inputEnabled', false);
            this.game.server.messages.getRecords((records) => {
                if (records) {
                    let recordsGroup = this.game.add.responsiveGroup()
                    let prevRecord
                    for (let i = 0; 10 < records.length ? i < 10 : i < records.length; i++) {
                        let record = this.game.add.responsiveText(prevRecord ? prevRecord.height * i : 0, 0,
                            records[i].name + ':' + records[i].bestScore, {fill: "#ffffff"}, Fabrique.PinnedPosition.topLeft
                        );
                        recordsGroup.add(record)
                    }
                    recordsGroup.setPortraitScaling(80, true, false, Fabrique.PinnedPosition.topLeft, this.game.width * 0.1)
                }
            })
        }
        else {
            let errorMsg = this.game.add.responsiveText(0, 0,
                'нет соединения'
            );
            errorMsg.anchor.set(0.5, 1)
            errorMsg.setPortraitScaling(50, true, true, Fabrique.PinnedPosition.bottomCenter, 0, 0);
        }
        // this.game.createBtnBack('MainMenu')

    }
}