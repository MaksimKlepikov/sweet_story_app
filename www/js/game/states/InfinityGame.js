/**
 * Created by kevrat on 08.10.2016.
 */

class InfinityGame extends Phaser.State {
    /**
     * Create State
     */
    create() {
        this.game.createBtnBack('MainMenu')
        this.gameField = new GameField('infinity', null, game, 0, 0, 500, 500, 6, 6)
        this.header = this.game.createHeader(this.game.height);
        this.game.add.tween(this.header).to({y: -this.header.height}, 500, Phaser.Easing.Linear.In, true)
    }

    /**
     * Update State
     */
    update() {
        this.gameField.update();
    }
}