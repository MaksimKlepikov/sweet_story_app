/**
 * Created by kevrat on 08.10.2016.
 */
var SelectLevel = function () {
};
SelectLevel.prototype = {
    init: function () {

    },

    preload: function () {
    },

    create: function () {
        this.createSignals();
        this.bg = this.createBg();
        this.createHills()
        this.game.createBtnBack('MainMenu')
    },
    createBg: function () {
        let bg = game.add.tileSprite(0, game.height * 0.6, game.width, this.game.cache.getFrame('main-header').height, 'main-header');

        bg.inputEnabled = true;
        bg.isCanDrag = true
        // bg.input.enableDrag(false);
        // bg.anchor.set(0.5,0)
        // map can be dragged only if it entirely remains into this rectangle
        // bg.input.boundsRect = new Phaser.Rectangle(game.width - bg.width, game.height - bg.height, bg.width * 2 - game.width, bg.height * 2 - game.height);
        // bg.input.boundsRect = new Phaser.Rectangle(game.width - bg.width, game.height - bg.height,2000, 2000);
        this.game.input.onDown.add(function () {
        }, this);
        this.game.input.onUp.add(function () {
        }, this);

        return bg;
    },
    updateCamera: function () {
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

    },
    createHills: function () {
        this.hills = game.add.group()
        let hillsJSON = game.cache.getJSON('hills');
        for (let i = 0; i < hillsJSON.length; i++) {
            let hill = game.add.group();
            let prevTile = null;
            let doneTiles = this.game.userController.user.progress[i].done;
            for (let j = 0; j < hillsJSON[i].items.length; j++) {
                let item = hillsJSON[i].items[j];
                let x = 0;
                let y = this.bg.y;
                if(prevTile){
                    y = prevTile.y - prevTile.height*item.pos.dist*Math.sin(item.pos.angle * (Math.PI / 180));
                    let c = prevTile.width*item.pos.dist*Math.cos(item.pos.angle * (Math.PI / 180))
                    x=prevTile.x + c;
                }
                let tile = this.game.add.sprite(x, y, 'icons', item.name)
                if(j+1>doneTiles){
                    tile.tint=0x000000;
                    tile.alpha=0.5
                }
                tile.angle = item.angle;
                hill.add(tile);
                prevTile = tile;

            }
            hill.x += hill.width*1.5 * i
            this.hills.add(hill)
            let btnSelectHill = game.add.button(0, hill.bottom, 'main-play')
            if(doneTiles<hillsJSON[i].items.length && this.game.userController.userInStorage.level>=i){
                btnSelectHill.onInputDown.add(()=>this.signals.startLevel.dispatch(hillsJSON[i]), this);
            }
            else{
                btnSelectHill.tint=0x2E2E37;
                btnSelectHill.alpha=0.5

            }
            hill.add(btnSelectHill);
            let hillName = game.add.responsiveText(btnSelectHill.width/2,  hill.bottom,
                hillsJSON[i].name,{fill: "#ffffff"}
            );
            hillName.anchor.set(0.5,0)
            hill.add(hillName);

        }

    },
    createSignals:function () {
        this.signals = {}
        this.signals.startLevel = new Phaser.Signal();
        this.signals.startLevel.add(function (hill) {
            this.game.state.start('Game', true, false, hill)
        }, this);
    },
    update: function () {
        this.updateCamera();
    },
    render:function () {
        // game.debug.geom(this.hills.children[0].getBounds(),'rgb(0,255,0)',false);
    }


};