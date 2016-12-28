/**
 * Created by kevrat on 24.12.2016.
 */

var Game = function (){};
Game.prototype = {
    init:function(hill){
        this.currentLevel = hill
        // console.log(this.currentLevel.currentTile)
    },

    preload: function () {
    },

    create: function () {
        this.createSignals()
        this.game.createBtnBack('SelectLevel')
        this.gameField = new GameField('sweetHill', this.currentLevel, game, this.game.width/10,0, this.game.width*0.9,this.game.width*0.9,6,6)
        this.createProgressWidget()
    },
    update:function () {
        this.gameField.update();
    },
    createSignals:function () {
        this.game.signals={}
        this.signals={}
        this.game.signals.isProgress=  new Phaser.Signal();
        this.signals.startSelectLevel = new Phaser.Signal();
        this.signals.startSelectLevel.add(function (btnAccept) {
            this.game.add.tween(btnAccept).to({y: -btnAccept.height}, 1000, Phaser.Easing.Back.In, true)
                .onComplete.add(()=>this.game.state.start('SelectLevel'))
        }, this);
    },

    createAwardWindow() {
        let btnAccept = this.game.createBtnLabel('Далее', 'main-button',
            Fabrique.PinnedPosition.topCenter,
            () => {
                this.signals.startSelectLevel.dispatch(btnAccept)
            }, 90)
        this.game.add.tween(btnAccept).to({y: this.game.height-btnAccept.height}, 1000, Phaser.Easing.Back.Out, true)//.onComplete.add(callback)
    },


    createProgressWidget: function () {
        let progressBar=game.add.responsiveGroup()

        let bgAllProgress = this.game.add.bitmapData(10, game.height);
        bgAllProgress.ctx.fillStyle = '#ffb763';
        bgAllProgress.ctx.beginPath();
        bgAllProgress.ctx.rect(0, 0, 10, game.height);
        bgAllProgress.ctx.fill();

        let allProgress = game.add.responsiveSprite(0,0,bgAllProgress)
        allProgress.anchor.set(0,1)

        let doneTiles = this.game.userController.getProgressByHillName(this.currentLevel.name).done;

        let bgCurrentProgress = this.game.add.bitmapData(10, 1+doneTiles*game.height/this.currentLevel.items.length);
        bgCurrentProgress.ctx.fillStyle = '#4a2918';
        bgCurrentProgress.ctx.beginPath();
        bgCurrentProgress.ctx.rect(0,0, 10,1+doneTiles*game.height/this.currentLevel.items.length);
        bgCurrentProgress.ctx.fill();

        let currentProgress = game.add.responsiveSprite(0,0,bgCurrentProgress)
        currentProgress.anchor.set(0,1)
        progressBar.add(allProgress)
        progressBar.add(currentProgress)
        let currentTile
        if(doneTiles>0){
            currentTile = game.add.responsiveSprite(0,currentProgress.world.y-currentProgress.height,'icons', this.currentLevel.items[doneTiles].name)
        }
        else{
            currentTile = game.add.responsiveSprite(0,currentProgress.world.y,'icons', this.currentLevel.items[doneTiles].name)
        }
        currentTile.anchor.set(0,0.5)
        currentTile.width = game.width*0.1
        currentTile.height = game.width*0.1
        progressBar.add(currentTile)
        progressBar.setPortraitScaling(90,false,false, Fabrique.PinnedPosition.bottomLeft,10,-game.height*0.1)

        this.game.signals.isProgress.add(function (hillName, done) {
            if (this.currentLevel.name === hillName) {
                this.game.add.tween(currentProgress).to({height: done*game.height/this.currentLevel.items.length}, 500, Phaser.Easing.Linear.In, true)//.onComplete.add(callback)

                if (done < this.currentLevel.items.length) {
                    currentTile.frameName = this.currentLevel.items[done].name
                    this.game.add.tween(currentTile).to({y: - done*game.height/this.currentLevel.items.length}, 500, Phaser.Easing.Linear.In, true)//.onComplete.add(callback)
                }
                else{
                    if(progressBar.children[2]){
                        progressBar.children[2].destroy()

                    }
                }

            }
        }, this);

    },


};