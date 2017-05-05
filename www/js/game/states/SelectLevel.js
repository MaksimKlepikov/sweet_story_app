/**
 * Created by kevrat on 08.10.2016.
 */
import ButtonLabel from '../gui/ButtonLabel'

export default class SelectLevel extends Phaser.State {
    /**
     * Create State
     */
    create() {
        this.createSignals();
        this.bg = this.createBg();
        this.createHills()
        this.gui = {}
        this.gui.buttons = this.game.add.group();
        let btnBack = new ButtonLabel(this.game, 0, 0, 'assets', 'btn-back', '', () => {
            // this.gui.header.expand(this.game.height).onComplete.add(() => {
            //     this.game.state.start('MainMenu')
            // })
            this.game.state.start('MainMenu')
        });
        btnBack.alignIn(this.game.camera.bounds, Phaser.BOTTOM_RIGHT)
        this.gui.buttons.add(btnBack);
        btnBack.activateInputsTweens();
    }

    /**
     * Create and return background
     * @returns {Phaser.TileSprite}
     */
    createBg() {
        let bg = this.game.add.tileSprite(0, this.game.height * 0.6, this.game.width, this.game.cache.getFrame('main-header').height, 'main-header');

        bg.inputEnabled = true;
        bg.isCanDrag = true
        this.game.input.onDown.add(function () {
        }, this);
        this.game.input.onUp.add(function () {
        }, this);

        return bg;
    }

    /**
     * Update camera
     */
    updateCamera() {
        if (this.game.input.activePointer.isDown) {
            if (this.game.origDragPoint) {
                if (this.bg.isCanDrag) {

                    let diffY = this.game.origDragPoint.y - this.game.input.activePointer.position.y;
                    let diffX = this.game.origDragPoint.x - this.game.input.activePointer.position.x;

                    if (this.game.height - this.bg.y - diffY <= this.bg.height) {
                        this.bg.y -= diffY;
                        this.hills.y -= diffY
                    }
                    else {
                        this.bg.isCanDrag = false
                        this.game.add.tween(this.bg).to({y: this.bg.y + 100}, 250, Phaser.Easing.Back.In, true).onComplete.add(() => this.bg.isCanDrag = true)
                        this.game.add.tween(this.hills).to({y: this.hills.y + 100}, 250, Phaser.Easing.Back.In, true)
                    }


                    this.bg.tilePosition.x -= diffX;
                    this.hills.x -= diffX

                }
            }
            this.game.origDragPoint = this.game.input.activePointer.position.clone();
        } else {
            this.game.origDragPoint = null;
        }

    }

    /**
     * Create hills
     */
    createHills() {
        this.game.userController.syncUser().then(() => {
            this.hills = this.game.add.group()
            let hillsJSON = this.game.cache.getJSON('hills');
            for (let i = 0; i < hillsJSON.length; i++) {
                let hill = this.game.add.group();
                let prevTile = null;
                let doneTiles = this.game.userController.user.progress[i].done;
                for (let j = 0; j < hillsJSON[i].items.length; j++) {
                    let item = hillsJSON[i].items[j];
                    let x = 0;
                    let y = this.bg.y;
                    if (prevTile) {
                        y = prevTile.y - prevTile.height * item.pos.dist * Math.sin(item.pos.angle * (Math.PI / 180));
                        let c = prevTile.width * item.pos.dist * Math.cos(item.pos.angle * (Math.PI / 180))
                        x = prevTile.x + c;
                    }
                    let tile = this.game.add.sprite(x, y, 'assets', item.name);
                    if (hillsJSON[i].bronzeItem === j) {
                        tile.star = 'star-bronze';
                    }
                    if (hillsJSON[i].silverItem === j) {
                        tile.star = 'star-silver';
                    }
                    if (hillsJSON[i].items.length - 1 === j) {
                        tile.star = 'star-gold';
                    }
                    if (j >= doneTiles) {
                        tile.tint = 0x000000;
                        tile.alpha = 0.5
                    }
                    tile.angle = item.angle;
                    hill.add(tile);
                    prevTile = tile;
                }
                let btnSelectHill = this.game.add.sprite(0, 0, 'assets', 'btn-play');
                btnSelectHill.inputEnabled = true;
                if (i === 0 && doneTiles < hillsJSON[i].items.length ||
                    (i > 0 && this.game.userController.user.progress[i - 1].done >= hillsJSON[i - 1].bronzeItem && doneTiles < hillsJSON[i].items.length)
                ) {
                    btnSelectHill.events.onInputDown.add(() => this.signals.startLevel.dispatch(hillsJSON[i]), this);
                }
                else {
                    btnSelectHill.tint = 0x2E2E37;
                    btnSelectHill.alpha = 0.5
                }
                hill.add(btnSelectHill);
                btnSelectHill.alignTo(hill, Phaser.BOTTOM_CENTER);
                let hillName = this.game.add.text(0, 0,
                    hillsJSON[i].name, {fill: "#ffffff"}
                );
                hillName.alignTo(hill, Phaser.BOTTOM_CENTER);
                hill.add(hillName);
                this.hills.add(hill);
                this.hills.align(-1, 1, this.game.cache.getFrameByName('assets', 'lolipop2').width * 6, this.hills.height, Phaser.BOTTOM_LEFT);
                this.hills.alignTo(this.bg, Phaser.TOP_LEFT, 0, -hillName.height - btnSelectHill.height);
                for (let k = 0; k < hill.children.length - 1; k++) {
                    if (hill.children[k].star) {
                        let star = this.game.add.sprite(0, 0, 'assets', hill.children[k].star);
                        star.anchor.setTo(0.5)
                        star.width = this.game.cache.getFrameByName('assets', 'lolipop2').width;
                        star.scale.y = star.scale.x;
                        hill.addChild(star);
                        star.alignTo(hill.children[k], Phaser.RIGHT_CENTER);
                        star.tint = hill.children[k].tint;
                        // star.alpha = hill.children[k].alpha;
                    }
                }
            }

        })

    }

    /**
     * Create hills
     */
    createSignals() {
        this.signals = {}
        this.signals.startLevel = new Phaser.Signal();
        this.signals.startLevel.add(function (hill) {
            this.game.state.start('Game', true, false, hill)
        }, this);
    }

    /**
     * Update state
     */
    update() {
        this.updateCamera();
    }

}