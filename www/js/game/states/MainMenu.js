/**
 * Create and return header
 * @param y - y coord on screen
 * @return {Fabrique.ResponsiveGroup}
 */


game.createHeader = function (y) {
    let headerGroup = game.add.responsiveGroup()

    let header = game.add.responsiveSprite(0, 0, 'main-header', null, Fabrique.PinnedPosition.topCenter);
    header.anchor.set(0.5, 0)
    header.setPortraitScaling(200, true, true, Fabrique.PinnedPosition.topCenter);

    let headerTail = game.add.graphics(0, 0);
    headerTail.beginFill(0xFEAA98);
    headerTail.drawRect(0, -game.height + headerTail.height, game.width, game.height);
    headerTail.endFill();

    headerGroup.add(header)
    headerGroup.add(headerTail)
    headerGroup.setPinned(Fabrique.PinnedPosition.topLeft, 0, y)
    game.add.tween(headerGroup).from({y: -header.height}, 500, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
    return headerGroup;

};

/**
 * Create and return button with text
 * @param text - text on button
 * @param key - key of button image
 * @param pin - pin on screen
 * @param callback - callback function
 * @param percentageSprite - size in percentage of button image relative screen
 * @param percentageText - size text in percentage relative button
 * @param x - x coord on screen
 * @param y - y coord on screen
 * @returns {Fabrique.ResponsiveGroup} - array of button and text
 */
game.createBtnLabel = function (text, key, pin, callback, percentageSprite, percentageText = 100, x = 0, y = 0) {
    let btnGroup = game.add.responsiveGroup();
    let btnSprite = game.add.responsiveButton(0, 0, key, callback, this)
    btnSprite.anchor.set(0.5)
    let style = {font: btnSprite.height / 2 + "px VAG World", fill: "#8a5746", align: 'center'};
    let btnLabel = game.add.responsiveText(0, 0, text, style)
    btnLabel.setPortraitScaling(percentageText, true, false)
    btnLabel.anchor.set(0.5)
    btnGroup.add(btnSprite)
    btnGroup.add(btnLabel)
    btnGroup.setPortraitScaling(percentageSprite, true, false, pin, x, y)
    return btnGroup
};

/**
 * Create and return button, what start state
 * @param stateName - name of start state
 * @returns {Fabrique.ResponsiveButton} - button
 */
game.createBtnBack = function (stateName) {
    let btnBackToMenu = game.add.responsiveButton(0, 0, 'main-menu', () => game.state.start(stateName), this)
    btnBackToMenu.setPortraitScaling(10, true, true, Fabrique.PinnedPosition.bottomLeft)
    btnBackToMenu.anchor.set(0, 1)
    return btnBackToMenu
};

var MainMenu = function () {
};
MainMenu.prototype = {
    /**
     * Create State
     */
    create: function () {
        this.signals = {}
        this.signals.startInfinityGame = new Phaser.Signal();
        this.signals.startSelectLevel = new Phaser.Signal();
        this.signals.showRecordBoard = new Phaser.Signal();
        this.signals.startSelectLevel.add(() => {
            this.expandHeader(() => {
                game.state.start('SelectLevel')
            })
        });
        this.signals.showRecordBoard.add(() => {
            this.expandHeader(() => {
                this.createRecordBoard()
            })
        });
        this.signals.startInfinityGame.add(() => {
            this.expandHeader(() => {
                game.state.start('InfinityGame')
            })
        });
        this.createBg();
        this.createBtns();
        this.header = this.game.createHeader(0)

    },

    /**
     * Start header expand animation
     * @param callback
     */
    expandHeader: function (callback) {
        this.game.add.tween(this.header).to({y: this.game.height}, 500, Phaser.Easing.Back.In, true).onComplete.add(callback)
    },

    /**
     * Start reset header animation
     * @param callback
     */
    resetHeader: function (callback) {
        this.game.add.tween(this.header).to({y: 0}, 500, Phaser.Easing.Back.In, true).onComplete.add(callback)
    },

    /**
     * Create buttons
     */
    createBtns: function () {
        let btnSelectLevel = game.createBtnLabel('Гора сладостей', 'main-button',
            Fabrique.PinnedPosition.middleCenter,
            () => {
                this.signals.startSelectLevel.dispatch()
            }, 70)

        let btnInfinityGame = game.createBtnLabel('Игра на рекорд', 'main-button',
            Fabrique.PinnedPosition.middleCenter,
            () => {
                this.signals.startInfinityGame.dispatch()
            }, 70, 100, 0, btnSelectLevel.height * 3)

        let btnShowRecordBoard = game.createBtnLabel('Рекорды', 'main-button',
            Fabrique.PinnedPosition.middleCenter,
            () => {
                this.signals.showRecordBoard.dispatch()
            }, 70, 70, 0, btnSelectLevel.height * 6)
        this.mainButtons = game.add.responsiveGroup()
        this.mainButtons.add(btnSelectLevel)
        this.mainButtons.add(btnInfinityGame)
        this.mainButtons.add(btnShowRecordBoard)

    },

    /**
     * Create background
     */
    createBg: function () {
        let bg = this.game.add.responsiveSprite(0, 0, 'main-bg', null, Fabrique.PinnedPosition.middleCenter);
        bg.anchor.set(0.5)
        bg.setPortraitScaling(100, true, true, Fabrique.PinnedPosition.middleCenter);
    },

    /**
     * Create board of records
     */
    createRecordBoard: function () {

        if (game.server.connected) {

            this.mainButtons.setAll('inputEnabled', false);
            this.game.server.messages.getRecords((records) => {
                if(records){
                    let recordsGroup = game.add.responsiveGroup()
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
            let errorMsg = game.add.responsiveText(0, 0,
                'нет соединения'
            );
            errorMsg.anchor.set(0.5, 1)
            errorMsg.setPortraitScaling(50, true, true, Fabrique.PinnedPosition.bottomCenter, 0, 0);
        }
        this.game.createBtnBack('MainMenu')

    }
};