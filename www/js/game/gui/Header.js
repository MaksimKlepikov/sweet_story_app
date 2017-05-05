/**
 * Created by kevrat on 12.02.2017.
 */
export default class Header extends Phaser.TileSprite{
    constructor(game, x, y, bgSpriteName, callback = ()=>{}) {
        super(game, x, y, game.cache.getFrame('main-header').width, game.cache.getFrame('main-header').height, bgSpriteName)
        // let sprite = game.add.image(x, y, bgSpriteName);
        // this.width = this.game.width
        this.scale.x *= game.width/game.cache.getFrame('main-header').width;
        this.scale.y = this.scale.x;

        let spriteTail = game.add.graphics(x, y);
        spriteTail.beginFill(0xFEAA98);
        spriteTail.drawRect(0, -game.height*2/this.scale.y -y, game.width/this.scale.x, game.height*2/this.scale.y);
        spriteTail.endFill();
        this.addChild(spriteTail);
        spriteTail.scale.x =1;
        spriteTail.scale.y =1;
    }
    expand(y = this.game.height){
        return this.game.add.tween(this).to({y}, 250, Phaser.Easing.Sinusoidal.InOut, true)
    }
    reset(y = 0){
        return this.game.add.tween(this).to({y}, 250, Phaser.Easing.Sinusoidal.InOut, true)
    }
}