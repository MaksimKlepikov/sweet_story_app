/**
 * Created by kevrat on 19.02.2017.
 */
export default class Item extends Phaser.Sprite {
    constructor(game, i, j, size, itemIcon, x = 0, y = 0) {
        super(game, x, -size, 'assets', itemIcon);
        // this.anchor.setTo(0.5);
        // this.height = size;
        this.i = i;
        this.j = j;
        // this.anchor.set(0.5)
        // this.scale.x = this.scale.y;

        // let tileIcon = this.tileTypes[this.random.integerInRange(0, this.tileTypes.length - 1)];

        // if (tileType) {
        //     tileIcon = tileType
        // }

        // let bonusChance = this.random.integerInRange(0, 100)
        // let bonusType = null;
        // let bonusIcon = null;

        // let tile
        // if (bonusType) {
        //     tile = this.game.add.sprite((j * tileSize) + tileSize / 2, 0, 'icons', bonusIcon)
        // }
        // else {
        //     tile = this.game.add.sprite((j * tileSize) + tileSize / 2, 0, 'icons', tileIcon)
        //
        // }
        //
        // // tile.bonusType = bonusType;
        //
        // this.anchor.setTo(0.5);
        //
        this.inputEnabled = true;
        //
        this.tileType = itemIcon;
        this.scale.origin = {x: this.scale.x, y: this.scale.y}
        this.scaleTween = this.game.add.tween(this.scale)
            .to({x: this.scale.x * 1.1, y: this.scale.y * 1.1}, 250, Phaser.Easing.Linear.Out, false, 0, -1, true);


        //
        // this.events.onInputDown.add(this.tileDown, this);

        // const gameField = this;
        // game.add.existing(this);


    }

    scaleUp() {

    }

    scaleDown() {

    }

    switchScaleTween() {
        if (this.visible) {//if not destroyed
            if (this.scaleTween.isRunning) {
                this.scaleTween.stop(true);
                this.scaleTween = this.game.add.tween(this.scale)
                this.scaleTween.to({
                    x: this.scale.origin.x,
                    y: this.scale.origin.y
                }, 250, Phaser.Easing.Linear.Out, true);
                return
            }
            this.scaleTween = this.game.add.tween(this.scale)
                .to({x: this.scale.x * 1.1, y: this.scale.y * 1.1}, 250, Phaser.Easing.Linear.Out, true, 0, -1, true);

        }

    }
}