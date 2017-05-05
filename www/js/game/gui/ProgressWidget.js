/**
 * Created by kevrat on 05.03.2017.
 */
export default class ProgressWidget extends Phaser.Sprite {
    constructor(game, currentLevel, height) {
        let bgAllProgress = game.add.bitmapData(10, height);
        bgAllProgress.ctx.fillStyle = '#ffb763';
        bgAllProgress.ctx.beginPath();
        bgAllProgress.ctx.rect(0, 0, 10, height);
        bgAllProgress.ctx.fill();
        super(game, 0, 0, bgAllProgress)
        this._currentLevel = currentLevel;

        // let doneTiles = game.userController.getProgressByHillName(this.currentLevel.name).done;
        let doneTiles = 0;

        let bgCurrentProgress = game.add.bitmapData(10, 1 + doneTiles * height / this.currentLevel.items.length);
        bgCurrentProgress.ctx.fillStyle = '#4a2918';
        bgCurrentProgress.ctx.beginPath();
        bgCurrentProgress.ctx.rect(0, 0, 10, 1 + doneTiles * height / this.currentLevel.items.length);
        bgCurrentProgress.ctx.fill();

        let currentProgress = game.add.sprite(0, 0, bgCurrentProgress)
        this.addChild(currentProgress);
        currentProgress.anchor.setTo(0.5, 1)
        currentProgress.alignIn(this, Phaser.BOTTOM_CENTER);
        let currentTile
        if (doneTiles > 0) {
            currentTile = game.add.sprite(0, 0, 'assets', this.currentLevel.items[doneTiles].name)
        }
        else {
            currentTile = game.add.sprite(0, 0, 'assets', this.currentLevel.items[doneTiles].name)
        }
        this.addChild(currentTile);
        currentTile.anchor.setTo(0.5)
        currentTile.alignTo(currentProgress, Phaser.TOP_CENTER);
        currentTile.y = this.height - currentProgress.height

        game.state.getCurrentState().signals ?
            game.state.getCurrentState().signals.isProgress ?
                game.state.getCurrentState().signals.isProgress.add((progress) => {

                    let newHeight = progress.done * this.height / this.currentLevel.items.length
                    let newY = this.height - newHeight;
                    this.game.add.tween(currentProgress).to({height: newHeight}, 500, Phaser.Easing.Linear.In, true)//.onComplete.add(callback)

                    if (progress.done < this.currentLevel.items.length) {
                        currentTile.frameName = this.currentLevel.items[progress.done].name;
                        this.game.add.tween(currentTile).to({y: newY}, 500, Phaser.Easing.Linear.In, true)//.onComplete.add(callback)
                    }
                    else {
                        currentTile.kill();
                    }
                })
                : console.error('signal isProgress is not defined in signals')
            : console.error('signals is not defined in current state')


    }

    get currentLevel() {
        return this._currentLevel;
    }

    set currentLevel(value) {
        this._currentLevel = value;
    }
}